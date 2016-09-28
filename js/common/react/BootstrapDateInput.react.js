var PBPlus = require('../../common/core/PBPlus.js');
var ClassNames = require('classnames');
var BootstrapSelect = require('./BootstrapSelect.react.js');
var BootstrapInput = require('./BootstrapInput.react.js');
var BootstrapDateInput = React.createClass({
    getInitialState: function(e) {
        return { year: undefined, month: undefined, day: undefined, time: '00:00' }
    },
    statusClassNameDictionary: {
        success: {formGroup: 'has-success'},
        warning: {formGroup: 'has-warning'},
        error: {formGroup: 'has-error'},
        default: {formGroup: ''},
    },
    onChange: function(e) {
        var state = this.state;
        state.year = this.refs.year.getValue();
        state.month = this.refs.month.getValue();
        state.day = this.refs.day.getValue();
        if(!!this.refs.time) { state.time = this.refs.time.getValue(); }
        this.setState(state);
        if(this.props.parentOnDateChange) {
            this.props.parentOnDateChange(this.getDate());
        }
    },
    getDate: function() {
        var year = Number(this.refs.year.getValue());
        var month = Number(this.refs.month.getValue()) - 1;
        var day = Number(this.refs.day.getValue());
        var time = this.state.time;
        if(!!this.refs.time) { time = this.refs.time.getValue(); }
        var hours = Number(time.slice(0, -3));
        var minutes = Number(time.slice(3));
        return new Date(year, month, day, hours, minutes).getTime()/1000;
    },
    render: function() {
        var gridWidth = this.props.gridWidth || '12';
        var disabled = this.props.disabled || 'false';
        var label = this.props.label || '';
        var labelHidden = this.props.labelHidden || false;
        var title = this.props.title || '';
        var status = this.props.status || 'default';
        var errorMessage = this.props.errorMessage || '';

        var year = this.state.year;
        var month = this.state.month;
        var date = this.state.day;
        var time = this.state.time;
        if(this.props.timestampSecond) {
            var dateObject = new Date(this.props.timestampSecond*1000);
            year = dateObject.getFullYear();
            month = dateObject.getMonth() + 1;
            date = dateObject.getDate();
            time = PBPlus.getDateStringWithFormat(dateObject.getTime(), 'hh:mm');
        }

        // Make option arrays.
        var thisYear = new Date(Date.now()).getFullYear();
        var yearRange = this.props.yearRange || [thisYear - 10, thisYear + 10];
        var yearArray = [];
        for(var i = yearRange[0]; i <= yearRange[1]; ++i) { yearArray.push(i); }
        var monthArray = [];
        for(var i = 1; i < 13; ++i) { monthArray.push(i); }
        var monthDayArray = [28, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var dayArray = [];
        if((0 === year%400) || ((0 === year%4) && (0 != year%100))) {
            monthDayArray[2] = 29;
        }
        var monthDay = monthDayArray[month] || monthDayArray[0];
        for(var i = 1; i <= monthDay; ++i) { dayArray.push(i); }

        // Make errorMessageElement.
		var errorMessageElement = undefined;
        year = Number(year); month = Number(month); date = Number(date);
        if((year || month || date) && (!year || !month || !date)) {
            var errorString = '日期錯誤';
            if(!year) { errorString = '請選擇年份'; }
            else if(!month) { errorString = '請選擇月份'; }
            else if(!date) { errorString = '請選擇日期'; }

            errorMessageElement = <li className='errorInfo' ref='errorMessage'>{errorString}</li>;
        }

        // Make time input.
        var enableTime = this.props.enableTime;
        var timeInput = undefined;
        if(enableTime) {
            timeInput = <BootstrapInput
                ref='time' gridWidth={'5'}
                label={'時間'} labelHidden={true} title={title}
                status={status} hasFeedback={true} errorMessage={''}
                type={'time'} value={time} onChange={this.onChange}
            />;
        }

        var componentClassName = ClassNames(
            'bootstrap-date-input', 'form-group', 'col-md-' + gridWidth,
            this.statusClassNameDictionary[status].formGroup
        );
        var labelClassName = ClassNames('control-label', {'sr-only': labelHidden});
        var helper = undefined, helpUuid = undefined;
        if(('error' === status) || ('warning' === status) && !!errorMessage) {
            helpUuid = PBPlus.newUuid();
            helper = <span id={helpUuid} className='help-block'>{errorMessage}</span>;
        }
        return <div className={componentClassName}>
            <label className={labelClassName}>{label}</label>
            <div className='row'>
                <BootstrapSelect
                    ref='year' gridWidth={enableTime ? '3' : '6'}
                    label={'年'} labelHidden={true} title={'西元'}
                    status={status} errorMessage={''} options={yearArray}
                    value={year || '西元'} onChange={this.onChange}
                />
                <BootstrapSelect
                    ref='month' gridWidth={enableTime ? '2' : '3'}
                    label={'月'} labelHidden={true} title={'月'}
                    status={status} errorMessage={''} options={monthArray}
                    value={month || '月'} onChange={this.onChange}
                />
                <BootstrapSelect
                    ref='day' gridWidth={enableTime ? '2' : '3'}
                    label={'日'} labelHidden={true} title={'日'}
                    status={status} errorMessage={''} options={dayArray}
                    value={date || '日'} onChange={this.onChange}
                />
                {timeInput}
            </div>
            {helper}
        </div>;
    }
})
module.exports = BootstrapDateInput;

//* vim: filetype=php.javascript.jsx
//* vim: dictionary=~/.vim/dict/javascript.dict
