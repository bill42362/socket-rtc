// Header.react.js
var ClassNames = require('classnames');
var Header = React.createClass({
    render: function() {
        return <header id="header">
            <nav className="navbar navbar-default navbar-fixed-top">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">FR</a>
                    <ul className="nav navbar-nav">
                        <li className='nav-item' >
                            <a className="nav-link" href="#">#</a>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>;
    }
});
module.exports = Header;

//* vim: filetype=php.javascript.jsx
//* vim: dictionary=~/.vim/dict/javascript.dict
