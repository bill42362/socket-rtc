'use strict'
const Debug = require('debug');
const Fs = require('fs');
const Hapi = require('hapi');
const Http2 = require('http2');
const Inert = require('inert');

const App = function() {};
App.prototype.server = new Hapi.Server();
App.prototype.listener = Http2.createServer({
    key: Fs.readFileSync('./ssl/localhost.key'),
    cert: Fs.readFileSync('./ssl/localhost.crt')
});
//App.prototype.listener.prototype.address = function() { return this._server.address() }
App.prototype.routes = [
    { method: 'get', path: '/{param*}', handler: { directory: {
        path: 'dist/html/reception', redirectToSlash: true, index: ['index.html'],
    } } },
    { method: 'get', path: '/js/{param*}', handler: { directory: { path: 'dist/js', } } },
    { method: 'get', path: '/css/{param*}', handler: { directory: { path: 'dist/css', } } },
    { method: 'get', path: '/data/{param*}', handler: { directory: { path: 'data/', } } },
];
App.prototype.run = function() {
    const server = this.server;
    server.connection({listener: this.listener, port: '3000', tls: true});
    server.register(Inert, () => {});
    server.route(this.routes);
    server.start(err => {
        err && Debug('http2:error')(err);
        Debug('http2')(`Started ${server.connections.length} connections`);
    });
};
module.exports = App;

const app = new App();
app.run();
