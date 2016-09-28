// RadialConvergence.react.js
'use strict'
import React from 'react';
import ClassNames from 'classnames';

class RadialConvergence extends React.Component {
    constructor(props) {
        super(props);
        props.points.forEach((point, index) => {
            point.degree = index*360/props.points.length;
        });
        this.state = {
            points: props.points,
            antialiasingFactor: 2,
            hoveringIds: [],
            shouldCallOnChange: false,
        };
        this.context = undefined;
        this.transformToCanvas = this.transformToCanvas.bind(this);
        this.getValue = this.getValue.bind(this);
        //this.logout = this.logout.bind(this);
        // Operations usually carried out in componentWillMount go here
    }
    getValue() { return this.state.hoveringIds; }
    transformToCanvas(point, unitInPixel = Number(5)) {
        const canvas = this.refs.canvas;
        const center = {x: canvas.width/2, y: canvas.height/2};
        var result = {x: center.x + unitInPixel*point.x, y: center.y - unitInPixel*point.y};
        return result;
    }
    drawCircle(center, opt_radius, opt_style) {
        const ctx = this.context;
        let radius = opt_radius || 4;
        ctx.fillStyle = opt_style || '#888';
        ctx.beginPath();
            ctx.moveTo(center.x + radius, center.y);
            ctx.arc(center.x, center.y, radius, 0, Math.PI*2, true);
        ctx.fill();
    }
    drawLink(curve, opt_lineWidth, opt_style) {
        const ctx = this.context;
        ctx.lineWidth = opt_lineWidth || 3;
        ctx.strokeStyle = opt_style || '#555';
        ctx.beginPath();
            ctx.moveTo(curve.from.x, curve.from.y);
            ctx.bezierCurveTo(
                curve.cp1.x, curve.cp1.y,
                curve.cp2.x, curve.cp2.y,
                curve.to.x, curve.to.y
            );
        ctx.stroke();
    }
    getPointFromDegree(degree, center = {x: 0, y: 0}, radius = 1) {
        const arc = Math.PI*degree/180;
        const unitPoint = {x: Math.sin(arc), y: Math.cos(arc)};
        return {x: center.x + unitPoint.x*radius, y: center.y + unitPoint.y*radius};
    }
    getDegreePairs(links, points) {
        return links.map(link => {
            var fromDegree = undefined, toDegree = undefined;
            points.forEach(point => {
                if(link.fromId === point.id) { fromDegree = point.degree; }
                else if(link.toId === point.id) { toDegree = point.degree; }
            });
            return {id: link.id, from: fromDegree, to: toDegree};
        });
    }
    getBezierCurves(pointPairs, center = {x: 0, y: 0}) {
        return pointPairs.map(pointPair => {
            var f = pointPair.from, t = pointPair.to, c = center;
            return {
                id: pointPair.id,
                from: pointPair.from,
                cp1: {
                    x: (f.x + f.x + f.x + t.x + t.x + c.x)/6,
                    y: (f.y + f.y + f.y + t.y + t.y + c.y)/6,
                },
                cp2: {
                    x: (f.x + f.x + t.x + t.x + t.x + c.x)/6,
                    y: (f.y + f.y + t.y + t.y + t.y + c.y)/6,
                },
                to: pointPair.to,
            };
        });
    }
    draw() {
        const state = this.state;
        const props = this.props;
        const antialiasingFactor = state.antialiasingFactor;
        const mousePosition = {
            x: antialiasingFactor*props.mousePosition.x,
            y: antialiasingFactor*props.mousePosition.y,
        };
        const canvas = this.refs.canvas;
        const ctx = this.context;
        const t = this.transformToCanvas;
        const zoom = 0.4*canvas.height;
        const circleSize = 5;
        const origin = t({x: 0, y: 0}, zoom);
        const degreePairs = this.getDegreePairs(props.links, state.points);
        const pointPairs = degreePairs.map(degreePair => {
            return {
                id: degreePair.id,
                from: t(this.getPointFromDegree(degreePair.from), zoom),
                to: t(this.getPointFromDegree(degreePair.to), zoom),
            };
        }, this);
        const bezierCurves = this.getBezierCurves(pointPairs, origin);
        let hoveringIds = [];

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw points.
        props.points.forEach(point => {
            var pointCenter = t(this.getPointFromDegree(point.degree), zoom);
            if(-1 != state.hoveringIds.indexOf(point.id)) {
                this.drawCircle(pointCenter, 2*circleSize, '#bce8f1');
            }
            this.drawCircle(pointCenter, circleSize);
            var isPointInPath = ctx.isPointInPath(mousePosition.x, mousePosition.y);
            if(isPointInPath) { hoveringIds.push(point.id); }
        }, this);
        bezierCurves.forEach(curve => {
            if(-1 != state.hoveringIds.indexOf(curve.id)) {
                this.drawLink(curve, 9, '#bce8f1');
            }
            this.drawLink(curve, 3);
            var isPointInStroke = ctx.isPointInStroke(mousePosition.x, mousePosition.y);
            if(isPointInStroke) { hoveringIds.push(curve.id); }
        });

        if(!state.hoveringIds.equals(hoveringIds)) {
            this.setState({hoveringIds: hoveringIds, shouldCallOnChange: true});
        }
    }
    componentDidMount() {
        const canvas = this.refs.canvas;
        let antialiasingFactor = this.state.antialiasingFactor;
        this.context = canvas.getContext('2d');
        this.context.canvas.width = antialiasingFactor*canvas.clientWidth;
        this.context.canvas.height = antialiasingFactor*canvas.clientHeight;
        this.context.translate(0.5, 0.5);
        this.draw();
    }
    componentWillReceiveProps(nextProps) {
        let points = nextProps.points.map((point, index) => {
            point.degree = index*360/nextProps.points.length;
            return point;
        });
        this.setState({points: points});
    }
    componentDidUpdate(prevProps, prevState) {
        this.draw();
        if(this.state.shouldCallOnChange && this.props.onChange) {
            this.props.onChange(this.state.hoveringIds);
            this.setState({shouldCallOnChange: false});
        }
    }
    render() {
        return <canvas
            ref='canvas' className='figure-canvas figure-canvas-radial-convergence'
        ></canvas>;
    }
}
module.exports = RadialConvergence;

//* vim: filetype=php.javascript.jsx
//* vim: dictionary=~/.vim/dict/javascript.dict
