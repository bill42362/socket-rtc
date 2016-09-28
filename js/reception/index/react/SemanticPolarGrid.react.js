// SemanticPolarGrid.react.js
'use strict'
import React from 'react';
import ClassNames from 'classnames';

class TreeNode {
    constructor(pointId, parentNode, layer = 0) {
        this.pointId = pointId;
        this.forwardChildNodeIds = [];
        this.backwordChildNodeIds = [];
        this.parentNode = parentNode;
        this.layer = layer;
    }
}

class SemanticPolarGrid extends React.Component {
    constructor(props) {
        super(props);
        this.state = { maxTreeLayer: 4, fullCircleLayer: 3, antialiasingFactor: 2, };
        this.context = undefined;
        this.transformToCanvas = this.transformToCanvas.bind(this);
        // Operations usually carried out in componentWillMount go here
    }
    transformToCanvas(point, unitInPixel = Number(5)) {
        const canvas = this.refs.canvas;
        const center = {x: canvas.width/2, y: canvas.height/2};
        var result = {x: center.x + unitInPixel*point.x, y: center.y - unitInPixel*point.y};
        return result;
    }
    drawLine(fromPoint, toPoint, lineWidth = Number(4), style = '#888') {
        const ctx = this.context;
        ctx.strokeStyle = style;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
            ctx.moveTo(fromPoint.x, fromPoint.y);
            ctx.lineTo(toPoint.x, toPoint.y);
        ctx.stroke();
    }
    drawCircle(center, radius = Number(4), style = '#888') {
        const ctx = this.context;
        ctx.fillStyle = style;
        ctx.beginPath();
            ctx.moveTo(center.x + radius, center.y);
            ctx.arc(center.x, center.y, radius, 0, Math.PI*2, true);
        ctx.fill();
    }
    getPointFromDegree(degree, center = {x: 0, y: 0}, radius = Number(1)) {
        const arc = Math.PI*degree/180;
        const unitPoint = {x: Math.sin(arc), y: Math.cos(arc)};
        return {x: center.x + unitPoint.x*radius, y: center.y + unitPoint.y*radius};
    }
    getNodeLayers(rootId = '', points = [], links = []) {
        const maxTreeLayer = this.state.maxTreeLayer;
        var nodeLayers = [];
        for(let i = 0; i < maxTreeLayer; ++i) {
            let tempNodes = [];
            if(0 === i) { tempNodes = [new TreeNode(rootId)]; }
            else {
                tempNodes = nodeLayers[i - 1].reduce((prevNodes, node) => {
                    let childNodeIds = node.forwardChildNodeIds.concat(node.backwordChildNodeIds);
                    return prevNodes.concat(childNodeIds.map(nodeId => {
                        return new TreeNode(nodeId, node, i);
                    }));
                }, []);
            }
            tempNodes.forEach(node => {
                node.forwardChildNodeIds = this.getLeafIdsOfNode(node, links);
                node.backwordChildNodeIds = this.getLeafIdsOfNode(node, links, true);
            }, this);
            nodeLayers.push(tempNodes);
        }
        return nodeLayers;
    }
    getLeafIdsOfNode(node, links = [], backward) {
        return links.map(link => {
            if(!backward && node.pointId === link.fromId) { return link.toId; }
            else if(backward && node.pointId === link.toId) { return link.fromId; }
        }).filter(leafId => { return leafId != undefined });
    }
    draw() {
        const state = this.state;
        const props = this.props;
        const antialiasingFactor = state.antialiasingFactor;
        const canvas = this.refs.canvas;
        const ctx = this.context;
        const t = this.transformToCanvas;
        const zoom = 0.4*canvas.height;
        const origin = t({x: 0, y: 0}, zoom);

        let nodeLayers = this.getNodeLayers(props.rootPointId, props.points, props.links);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Compute point degrees.
        let fullCircleLayer = state.fullCircleLayer - 1;
        let degreeStep = 360/nodeLayers[fullCircleLayer].length;
        let radius = fullCircleLayer*zoom/(state.maxTreeLayer - 1);
        nodeLayers[fullCircleLayer].forEach((node, index) => {
            node.degree = index*degreeStep;
            node.point = t(this.getPointFromDegree(node.degree, undefined, radius), 1);
        }, this);

        for(let i = fullCircleLayer - 1; -1 < i; --i) {
            let thisNodes = nodeLayers[i];
            let outerNodes = nodeLayers[i + 1];
            let minOuterNodeIndex = 0;
            let radius = i*zoom/(state.maxTreeLayer - 1);
            thisNodes.forEach(node => {
                let childNodeIdsCount = node.forwardChildNodeIds.length + node.backwordChildNodeIds.length;
                let maxOuterNodeIndex = minOuterNodeIndex + childNodeIdsCount - 1;
                if(maxOuterNodeIndex >= minOuterNodeIndex) {
                    node.degree = 0.5*(outerNodes[minOuterNodeIndex].degree + outerNodes[maxOuterNodeIndex].degree);
                    node.point = t(this.getPointFromDegree(node.degree, undefined, radius), 1);
                    minOuterNodeIndex = maxOuterNodeIndex + 1;
                }
            });
        }

        for(let i = fullCircleLayer + 1; i < state.maxTreeLayer; ++i) {
            let thisNodes = nodeLayers[i];
            let innerNodes = nodeLayers[i - 1];
            let radius = i*zoom/(state.maxTreeLayer - 1);
            let lastDegree = 0, sameParentCount = 0;
            thisNodes.forEach((thisNode, index) => {
                let parentNode = thisNode.parentNode;
                let parentNodeIndex = innerNodes.indexOf(parentNode);

                let parentNodePrev = innerNodes[parentNodeIndex - 1];
                let minDegree = undefined;
                if(parentNodePrev) {
                    minDegree = 0.5*(parentNodePrev.degree + parentNode.degree);
                } else {
                    parentNodePrev = innerNodes[innerNodes.length - 1];
                    // Rolling back min degree for head parentNode.
                    minDegree = 0.5*(-(360 - parentNodePrev.degree) + parentNode.degree);

                    // Rolling back lastDegree for first node.
                    if(0 === lastDegree) { lastDegree = minDegree; }
                }

                let parentNodePost = innerNodes[parentNodeIndex + 1];
                let maxDegree = undefined;
                if(parentNodePost) {
                    maxDegree = 0.5*(parentNodePost.degree + parentNode.degree);
                } else {
                    parentNodePost = innerNodes[0];
                    // Rolling forward max degree for tail parentNode.
                    maxDegree = 0.5*(360 + parentNodePost.degree + parentNode.degree);
                }

                let siblingNodeCount = parentNode.forwardChildNodeIds.length + parentNode.backwordChildNodeIds.length;
                let degreeStep = Math.abs(maxDegree - minDegree)/(siblingNodeCount + 1);
                thisNode.degree = lastDegree + degreeStep;
                thisNode.point = t(this.getPointFromDegree(thisNode.degree, undefined, radius), 1);

                lastDegree = thisNode.degree;
                ++sameParentCount;
                if(siblingNodeCount === sameParentCount) {
                    // Add tail margin for last node of the same parentNode.
                    lastDegree += degreeStep;
                    sameParentCount = 0;
                }
            });
        }

        // Draw points.
        nodeLayers.forEach(nodes => {
            nodes.forEach(node => { if(node.point) { this.drawCircle(node.point); } }, this);
        }, this);

        // Draw lines.
        nodeLayers.forEach((nodes, index) => {
            let innerNodes = nodeLayers[index - 1] || [];
            nodes.forEach(node => {
                if(node.point && node.parentNode) { 
                    this.drawLine(node.point, node.parentNode.point);
                }
            }, this);
        }, this);
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
    componentDidUpdate(prevProps, prevState) {
        this.draw();
        if(this.state.shouldCallOnChange && this.props.onChange) {
            this.props.onChange(this.state.hoveringIds);
            this.setState({shouldCallOnChange: false});
        }
    }
    render() {
        return <canvas
            ref='canvas' className='figure-canvas figure-canvas-semantic-polar-grid'
        ></canvas>;
    }
}
module.exports = SemanticPolarGrid;

//* vim: filetype=php.javascript.jsx
//* vim: dictionary=~/.vim/dict/javascript.dict
