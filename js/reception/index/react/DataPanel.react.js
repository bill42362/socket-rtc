// DataPanel.react.js
'use strict'
import React from 'react';
import ClassNames from 'classnames';
import RadialConvergence from './RadialConvergence.react.js';
import SemanticPolarGrid from './SemanticPolarGrid.react.js';
import DetailTable from './DetailTable.react.js';
import MouseTracker from './MouseTracker.react.js';

class DataPanel extends React.Component {
    constructor(props) {
        super(props);
        this.staticStrings = {
            previousStep: {string: '上一步', context: 'Button display of go previous step button.'},
        };
        this.state = {
            points: [], links: [],
            mousePosition: {x: -1, y: -1}, selectedPointId: '',
        };
        const pointCount = 70;
        for(let i = 0; i < pointCount; ++i) {
            this.state.points.push({id: Core.newUuid()});
        }
        // TODO: Hard coded point.
        this.state.selectedPointId = this.state.points[1].id;
        const linkCount = 60;
        for(let i = 0; i < linkCount; ++i) {
            this.state.links.push({
                id: Core.newUuid(),
                fromId: this.state.points[Math.floor(pointCount*Core.random())].id,
                toId: this.state.points[Math.floor(pointCount*Core.random())].id,
            });
        }
        /*
        for(let i = 0; i < linkCount; ++i) {
            this.state.links.push({
                id: Core.newUuid(),
                fromId: this.state.points[1].id,
                toId: this.state.points[i].id,
            });
        }
        */
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onHoveringIdsChange = this.onHoveringIdsChange.bind(this);
        // Operations usually carried out in componentWillMount go here
    }
    onMouseMove() {
        var mouseState = this.refs.mouseTracker.state;
        this.setState({mousePosition: mouseState.axis});
    }
    onHoveringIdsChange() {
        let state = this.state;
        let ids = this.refs.radialConvergence.getValue();
        let hoveredPoints = state.points.filter(point => {
            return -1 != ids.indexOf(point.id);
        });
        if(hoveredPoints[0] && state.selectedPointId != hoveredPoints[0].id) {
            this.setState({selectedPointId: hoveredPoints[0].id});
        }
    }
    componentDidMount() { }
    componentWillReceiveProps(nextProps) {
        this.setState({points: nextProps.points, links: nextProps.links});
    }
    render() {
        const state = this.state;
        let selectedData = state.points.filter(point => {
            return state.selectedPointId === point.id;
        })[0];
        return <div className='data-panel'>
            <a id='dataPanel' className='anchor'></a>
            <div className='panel panel-primary'>
                <div className='panel-heading'>Data Panel</div>
                <div className='panel-body row'>
                    <div className='col-md-6'>
                        <div className='thumbnail'>
                            <div className='ratio-wrap-16-9'>
                                <RadialConvergence
                                    ref='radialConvergence'
                                    points={state.points} links={state.links}
                                    mousePosition={state.mousePosition}
                                    onChange={this.onHoveringIdsChange}
                                />
                                <MouseTracker
                                    ref='mouseTracker'
                                    onMouseMove={this.onMouseMove}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='col-md-6'>
                        <div className='thumbnail'>
                            <div className='ratio-wrap-16-9'>
                                <SemanticPolarGrid
                                    rootPointId={state.selectedPointId}
                                    points={state.points} links={state.links}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <DetailTable data={selectedData} />
                <div className='panel-footer'>Footer</div>
            </div>
        </div>;
    }
}
module.exports = DataPanel;

//* vim: filetype=php.javascript.jsx
//* vim: dictionary=~/.vim/dict/javascript.dict
