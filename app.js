'use strict'
const Debug = require('debug');
const Fs = require('fs');
const Hapi = require('hapi');
const Https = require('https');
const Http2 = require('http2');
const Inert = require('inert');
const Io = require('socket.io');

const App = function() {};
App.prototype.server = new Hapi.Server();
App.prototype.listener = Http2.createServer({
    key: Fs.readFileSync('./ssl/localhost.key'),
    cert: Fs.readFileSync('./ssl/localhost.crt')
});
App.prototype.routes = [
    { method: 'get', path: '/{param*}', handler: { directory: {
        path: 'dist/html/reception', redirectToSlash: true, index: ['index.html'],
    } } },
    { method: 'get', path: '/js/{param*}', handler: { directory: { path: 'dist/js', } } },
    { method: 'get', path: '/css/{param*}', handler: { directory: { path: 'dist/css', } } },
    { method: 'get', path: '/data/{param*}', handler: { directory: { path: 'data/', } } },
];
App.prototype.webServerDebug = Debug('WebServer');
App.prototype.socketServerDebug = Debug('SocketServer');
App.prototype.runWebServer = function() {
    const server = this.server;
    server.connection({listener: this.listener, port: '3000', tls: true});
    server.register(Inert, () => {});
    server.route(this.routes);
    server.start(err => {
        err && this.webServerDebug(err);
        this.webServerDebug(`Started ${server.connections.length} connections`);
    }, this);
};
App.prototype.httpsServerHandler = function(request, response) {
    response.writeHead(200);
    response.end('hello world\n');
}
App.prototype.runSocketServer = function() {
    const options = {
        key: Fs.readFileSync('./ssl/localhost.key'),
        cert: Fs.readFileSync('./ssl/localhost.crt')
    };
    this.httpsServer = Https.createServer(options, this.httpsServerHandler).listen(5566);
    this.io = Io.listen(this.httpsServer);
    this.io.on('connection', this.onSocketConnection.bind(this));
};
App.prototype.onSocketConnection = function(socket) {
    this.socketServerDebug('Connection.', 'socket.id:', socket.id);
    socket.audioData = {lastTimestamp: 0, buffer: undefined};
    socket.on('audioBufferData', this.onAudioBufferDataGot.bind({self: this, socket: socket}));
    socket.on('disconnect', this.onSocketDisonnect.bind({self: this, socket: socket}));
}
App.prototype.onSocketDisonnect = function(socket) {
    this.self.socketServerDebug('Disconnect.', 'socket.id:', this.socket.id);
}
App.prototype.onAudioBufferDataGot = function(audioBufferData) {
    const self = this.self;
    const socket = this.socket;
    if(audioBufferData.timestamp > socket.audioData.lastTimestamp) {
        socket.audioData.lastTimestamp = audioBufferData.timestamp;
        socket.audioData.buffer = audioBufferData.buffer;
        socket.broadcast.emit('audioBufferData', audioBufferData);
    }
}
module.exports = App;

const app = new App();
app.runWebServer();
app.runSocketServer();
