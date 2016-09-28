// App.react.js
'use strict'
import React from 'react';
import ClassNames from 'classnames';
import Header from '../../../common/react/Header.react.js';
import DataPanel from './DataPanel.react.js';
import Footer from '../../../common/react/Footer.react.js';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.staticStrings = { };
        this.state = {
            data: { points: [], links: [], },
        };
        this.onGetKMTDataSuccess = this.onGetKMTDataSuccess.bind(this);
        // Operations usually carried out in componentWillMount go here
        if(window.Core && Core.ajax) {
            Core.ajax('/data/kmt.json', 'get', undefined, this.onGetKMTDataSuccess);
        }
    }
    onGetKMTDataSuccess(response) {
        let origNodes = response.nodes;
        let origLinks = response.links;
        //origNodes.length = 130;
        let points = origNodes.map(node => {
            node.id = Core.newUuid();
            return node;
        }).sort((a, b) => { return a.group - b.group; });
        let links = origLinks.filter(link => {
            return points[link.source] && points[link.target];
        }).map(link => {
            link.id = Core.newUuid();
            link.fromId = points[link.source].id;
            link.toId = points[link.target].id;
            return link;
        });
        this.setState({data: {points: points, links: links}});
    }
    render() {
        let state = this.state;
        return <div id='wrapper'>
            <Header />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-2">
                        <div className="page-anchor-list list-group list-group-root">
                            <a href="#top" className="list-group-item active">Top</a>
                            <a href="#radialConvergence" className="list-group-item">Radial Convergence</a>
                        </div>
                    </div>
                    <div className="col-md-10">
                        <DataPanel points={state.data.points} links={state.data.links} />
                    </div>
                </div>
            </div>
            <Footer />
        </div>;
    }
}
module.exports = App;
