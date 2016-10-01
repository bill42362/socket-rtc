// BootstrapImageDropZone.react.js
var ClassNames = require('classnames');
var BootstrapImageDropZone = React.createClass({
    getInitialState: function() {
        return { src: '', file: undefined, shouldCallback: false};
    },
    staticStrings: {
        selectImage: {
            string: '或點此選擇檔案',
            context: 'Ask user selecting file to upload instead of dragging.'
        },
    },
    statusClassNameDictionary: {
        success: {formGroup: 'has-success'},
        warning: {formGroup: 'has-warning'},
        error: {formGroup: 'has-error'},
        info: {formGroup: 'has-info'},
        default: {formGroup: ''},
    },
    imageType: /^image\//,
    getImageDatas: function() { return {src: this.state.src, file: this.state.file}; },
    cancelEventActions: function(e) { e.stopPropagation(); e.preventDefault(); },
    readFile: function(file) {
        var fileReader = new FileReader();
        fileReader.onload = this.onImageLoad;
        fileReader.readAsDataURL(file);
        this.setState({file: file});
    },
    selectFile: function() {
        var input = this.refs.fileSelector;
        if(input && document.createEvent) {
            var event = document.createEvent("MouseEvents");
            event.initEvent("click", true, false);
            input.dispatchEvent(event);
        }
    },
    onFileChange: function(e) {
        var files = e.target.files;
        if(this.imageType.test(files[0].type)) { this.readFile(files[0]); }
    },
    onDragEnter: function(e) { this.cancelEventActions(e); },
    onDragOver: function(e) { this.cancelEventActions(e); },
    onDrop: function(e) {
        this.cancelEventActions(e);
        var files = e.dataTransfer.files;
        if(this.imageType.test(files[0].type)) { this.readFile(files[0]); }
    },
    onImageLoad: function(e) {
        this.setState({src: e.target.result, shouldCallback: true});
    },
    componentDidUpdate: function(prevProps, prevState) {
        var props = this.props, state = this.state;
        if((prevProps.src != props.src) || (prevProps.file != props.file)) {
            this.setState({src: props.src, file: props.file});
        }
        if(state.shouldCallback && this.props.parentOnImageLoad) {
            this.setState({shouldCallback: false});
            this.props.parentOnImageLoad(state.src);
        }
    },
    render: function() {
        var strings = this.staticStrings;
        var src = this.props.src || this.state.src;
        var labelHidden = this.props.labelHidden || false;
        var status = this.props.status || 'default';
        var errorMessage = this.props.errorMessage || '';

        var helper = undefined, helpUuid = undefined;
        if((('error' === status) || ('warning' === status)) && !!errorMessage) {
            helpUuid = PBPlus.newUuid();
            helper = <span id={helpUuid} className='help-block'>{errorMessage}</span>;
        }
        var content = undefined;
        if(!src) {
            content = <div className='image-drop-zone-ui well' title={this.props.title}>
                <p>{this.props.title}</p>
                <button
                    className='select-image-button btn btn-primary'
                    title={this.staticStrings.selectImage.string}
                    onClick={this.selectFile}
                >
                    {this.staticStrings.selectImage.string}
                </button>
                <input
                    type='file' accept='image/*' multiple={false} ref='fileSelector'
                    onChange={this.onFileChange}
                    aria-describedby={helpUuid}
                />
            </div>;
        } else {
            content = <div className='image-drop-zone-preview panel panel-default'>
                <div className='panel-body'>
                    <img className='img-responsive img-thumbnail' src={src} />
                </div>
                <div className='panel-footer'>
                    <div
                        className="btn-group btn-group-justified" role="group"
                        aria-label={this.staticStrings.selectImage.string}
                    >
                        <div className="btn-group" role="group">
                            <button
                                type="button" className="btn btn-primary"
                                title={this.staticStrings.selectImage.string}
                                onClick={this.selectFile}
                            >
                                {this.staticStrings.selectImage.string}
                            </button>
                        </div>
                    </div>
                    <input
                        type='file' accept='image/*' multiple={false} ref='fileSelector'
                        onChange={this.onFileChange}
                        aria-describedby={helpUuid}
                    />
                </div>
            </div>;
        }
        var componentClassName = ClassNames(
            'image-drop-zone', 'form-group',
            this.statusClassNameDictionary[status].formGroup
        );
        var labelClassName = ClassNames('control-label', {'sr-only': labelHidden});
        return <div
            className={componentClassName}
            onDragEnter={this.onDragEnter}
            onDragOver={this.onDragOver}
            onDrop={this.onDrop}
        >
            <label className={labelClassName}>{this.props.label}</label>
            {content}
            {helper}
        </div>;
    }
});
module.exports = BootstrapImageDropZone;

//* vim: filetype=php.javascript.jsx
//* vim: dictionary=~/.vim/dict/javascript.dict
