import React from 'react';

export default class Alert extends React.Component {
    constructor() {
        super();

        this.withCloseClassName = '';
        this.btnClose = '';
        this.toggle = {
            display: 'block'
        };
    }

    componentWillMount() {
        if (this.props.withClose) {
            this.btnClose = (
                <button
                    type='button'
                    className='close'
                    data-dismissible='alert'
                    aria-label='Close'
                >
                    <span
                        aria-hidden='true'
                        style={{color: '#000'}}
                    >{'x'}</span>
                </button>
            );
        }
    }

    render() {
        return (
            <div
                id='flash'
                style={this.toggle}
            >
                <div
                    className={this.props.className + this.withCloseClassName}
                    role='alert'
                >
                    {this.btnClose}
                    <i className={this.props.iconClass}></i>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

Alert.propTypes = {
    className: React.PropTypes.string,
    iconClass: React.PropTypes.string,
    withClose: React.PropTypes.bool,
    children: React.PropTypes.any
};

Alert.defaultProps = {
    className: 'alert flash-success',
    iconClass: 'fa fa-check-circle-o',
    withClose: false,
    children: ''
};
