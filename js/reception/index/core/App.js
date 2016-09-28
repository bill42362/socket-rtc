// App.js
'use strict'
import ReactDOM from 'react-dom';
import App from '../react/App.react.js';
import Core from '../../../common/core/Core.js';
import CoreRtc from '../../../common/core/Rtc.js';

var onReactDOMRendered = function() {
}

var onReadyStateChange = function() {
    if(document.readyState == 'complete') {
        window.CoreRtc = new CoreRtc();
        ReactDOM.render(
            <App />,
            document.getElementById('app-root'),
            onReactDOMRendered
        );
    }
}
document.addEventListener('readystatechange', onReadyStateChange, false);
