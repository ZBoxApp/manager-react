import React from 'react';
import PropTypes from 'prop-types';
import Button from './button.jsx';

export default class Panel extends React.Component {
    render() {
        let btns = null;

        if (this.props.btnsHeader) {
            btns = this.props.btnsHeader.map((btn, i) => {
                if (btn.setComponent) {
                    return <span key={`button-${i}`}>{btn.setComponent}</span>;
                }
                return (
                    <Button
                        btnAttrs={btn.props}
                        key={`button-${i}`}
                    >
                        {btn.label}
                    </Button>
                );
            });
        }

        let panelHeader;
        if (this.props.hasHeader && (this.props.btnsHeader || this.props.title || this.props.filter)) {
            const { classCss } = this.props;
            panelHeader = (
                <div className={`panel-heading hbuilt clearfix ${classCss || ''}`}>
                    <div className='pull-right text-right'>{btns}</div>
                    <div className='heading-buttons pull-left text-left'>
                        {this.props.title || this.props.filter}
                    </div>
                </div>
            );
        }

        return (
            <div className={`hpanel ${this.props.classHeader || ''}`}>
                {panelHeader}
                {this.props.error}
                <div className='panel-body'>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

Panel.propTypes = {
    hasHeader: PropTypes.bool,
    btnsHeader: PropTypes.array,
    title: PropTypes.string,
    classHeader: PropTypes.string,
    error: PropTypes.element,
    children: PropTypes.any,
    filter: PropTypes.element,
    classCss: PropTypes.array
};

Panel.defaultProps = {
    hasHeader: true,
    btnsHeader: [],
    title: '',
    error: null,
    classHeader: ''
};
