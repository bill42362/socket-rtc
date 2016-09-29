// App.react.js
'use strict'
import React from 'react';
import ClassNames from 'classnames';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.staticStrings = { };
        this.state = { };

        this.onIoConnected = this.onIoConnected.bind(this);
        if(window.CoreRtc) {
            CoreRtc.connectIo();
            Core.eventCenter.registListener(CoreRtc, 'connectiosuccess', this.onIoConnected, this);
            Core.eventCenter.registListener(CoreRtc, 'connectioerror', this.onConnectIoError, this);
        }
    }
    onIoConnected(e) {
        navigator.mediaDevices.getUserMedia({audio: true, video: false})
        .then(function(audioStream) {
            CoreRtc.sendAudioStream(audioStream);
        })
        .catch(function(error) {
            console.log('onIoConnected() getUserMedia error:', error);
        })
    }
    onConnectIoError(e) { console.log(e); }
    render() {
        let state = this.state;
        return <div id='wrapper'>
        </div>;
    }
}
module.exports = App;
