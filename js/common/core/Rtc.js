import Core from './Core.js';
import EventCenter from './EventCenter.js';
import io from 'socket.io-client';
import Debug from 'debug';

Debug.disable();
if('production' != process.env.NODE_ENV) { Debug.enable('socket:*'); }
var socketErrorDebugger = Debug('socket:error');

if(undefined === window.Core) { window.Core = function() {}; };
Core.Rtc = function() {
    this.baseUrl = '';
    this.clientId = Core.newUuid();
	return this;
}

Core.Rtc.BUFFER_LENGTH = 1024;
Core.Rtc.prototype.audioBufferData = new Float32Array(Core.Rtc.BUFFER_LENGTH);
Core.Rtc.prototype.audioContext = new AudioContext();
Core.Rtc.prototype.audioBufferDataVisualize = document.getElementById('audio-buffer-data');
Core.Rtc.prototype.isIoConnected = function() { return this.io && this.io.connected; };
Core.Rtc.prototype.closeIo = function() {
    if(this.isIoConnected()) { this.io.close(); }
};

Core.Rtc.prototype.connectIo = function() {
    if(this.isIoConnected()) { return; }
    if(this.io) { this.io.connect(); return; }
    var socketHost = location.hostname;
    var socketPort = '5566';
    if(process.env.SOCKET) {
        socketHost = process.env.SOCKET.HOST || socketHost;
        socketPort = process.env.SOCKET.PORT || socketPort;
    }
    var connectOption = {
        'reconnection': true,
        'reconnectionDelay': 3000,
        'reconnectionDelayMax' : 5000,
        // 'reconnectionAttempts': 3,
        // query: 'user_pk=' + this.userPrimaryKey + '&token=' + this.appToken,
        // 'heartbeatInterval': 60000,
        // 'heartbeatTimeout': 60000,
    };
    this.io = io('https://' + socketHost + ':' + socketPort, connectOption);
    this.io.addEventListener('connect', this.onConnectIoSuccess.bind(this));
    this.io.addEventListener('audioBufferData', this.onAudioBufferDataGot.bind(this));

    window.addEventListener('beforeunload', this.closeIo.bind(this), false);

    // Error handlings.
    var errorHandlings = [
        {event: 'error', listener: this.onConnectIoError.bind(this)},
        {event: 'connect_error', listener: this.onConnectIoError.bind(this)},
        {event: 'connect_timeout', listener: this.onConnectIoTimeout.bind(this)},
        {event: 'connect_failed', listener: this.onConnectIoError.bind(this)},
        {event: 'disconnect', listener: this.onConnectIoError.bind(this)},
        {event: 'reconnect_attempt', listener: this.onAttemptReconnectIo.bind(this)},
        {event: 'reconnect_error', listener: this.onConnectIoError.bind(this)},
        {event: 'reconnect_failed', listener: this.onConnectIoError.bind(this)},
    ];
    errorHandlings.forEach(handler => {
        this.io.addEventListener(handler.event, function(e) {
            socketErrorDebugger(handler.event, JSON.stringify(e));
            handler.listener(e);
        }.bind(this));
    }, this);
};
Core.Rtc.prototype.onConnectIoSuccess = function(e) {
	Core.eventCenter.castEvent(this, 'connectiosuccess', e);
};
Core.Rtc.prototype.onAttemptReconnectIo = function(e) {
	Core.eventCenter.castEvent(this, 'ioattemptreconnect', e);
};
Core.Rtc.prototype.onConnectIoError = function(e) {
	Core.eventCenter.castEvent(this, 'connectioerror', e);
};
Core.Rtc.prototype.onConnectIoTimeout = function(e) {
	Core.eventCenter.castEvent(this, 'connectiotimeout', e);
	Core.eventCenter.castEvent(this, 'connectioerror', e);
};

Core.Rtc.prototype.sendAudioStream = function(audioStream) {
    let source = this.audioContext.createMediaStreamSource(audioStream);
    let scriptNode = this.audioContext.createScriptProcessor(Core.Rtc.BUFFER_LENGTH, 1, 1);
    scriptNode.onaudioprocess = this.onAudioProcess.bind(this);
    source.connect(scriptNode);
    scriptNode.connect(this.audioContext.destination);
}

Core.Rtc.prototype.onAudioProcess = function(e) {
    let inputData = e.inputBuffer.getChannelData(0);
    let outputData = e.outputBuffer.getChannelData(0);
    this.io.emit('audioBufferData', {timestamp: Date.now(), buffer: inputData});
    drawBuffer(inputData, sending2dContext);

    let audioBufferData = this.audioBufferData;
    outputData.set(audioBufferData);
    drawBuffer(outputData, output2dContext);
    audioBufferData.fill(0);
}

Core.Rtc.prototype.onAudioBufferDataGot = function(audioBufferData) {
    let buffer = audioBufferData.buffer;
    buffer.length = this.audioBufferData.length;
    drawBuffer(buffer, receving2dContext);
    this.audioBufferData.set(buffer);
}

module.exports = Core.Rtc;
