// DetailTable.react.js
'use strict'
import React from 'react';
import ClassNames from 'classnames';
import BootstrapTable from '../../../common/react/BootstrapTable.react.js';

class DetailTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() { }
    componentWillReceiveProps(nextProps) { }
    componentDidUpdate(prevProps, prevState) { }
    render() {
        let props = this.props;
        let columns = [
            {key: 'tag', display: '標籤'},
            {key: 'content', display: '內容'},
        ];
        let datas = [];
        if(props.data && props.data.tooltip) {
            let tempDatas = props.data.tooltip.split("\n");
            datas = tempDatas.map(tempData => {
                if(-1 != tempData.indexOf(': ')) {
                    let keyPair = tempData.split(': ');
                    let tag = keyPair[0], content = keyPair[1];
                    return {tag: tag, content: content};
                } else {
                    let values = tempData.split(' ');
                    let tag = values[1];
                    let content = values[2]
                    + ' (' + values.slice(3).join(', ').replace(/, $/, '') + ')';
                    return {tag: tag, content: content};
                }
            }).filter(data => { return data && data.tag; });
        }
        return <BootstrapTable
            titleList={columns} dataList={datas}
        ></BootstrapTable>;
    }
}
module.exports = DetailTable;

//* vim: filetype=php.javascript.jsx
//* vim: dictionary=~/.vim/dict/javascript.dict
