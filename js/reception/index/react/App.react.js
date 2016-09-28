// App.react.js
'use strict'
import React from 'react';
import ClassNames from 'classnames';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.staticStrings = { };
        this.state = { };
        if(window.CoreRtc) {
            CoreRtc.connectIo();
        }
    }
    render() {
        let state = this.state;
        return <div id='wrapper'>
        </div>;
    }
}
module.exports = App;
