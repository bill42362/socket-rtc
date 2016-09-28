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
	return this;
}

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

module.exports = Core.Rtc;
