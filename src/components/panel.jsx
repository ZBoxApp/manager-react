import React from 'react';
import Button from './button.jsx';

export default class Panel extends React.Component {
    render() {
        const btns = this.props.btnsHeader.map((btn, i) => {
            return (
                <Button
                    btnAttrs={btn.props}
                    key={`button-${i}`}
                >
                    {btn.label}
                </Button>
            );
        });

        let panelHeader;
        if (this.props.hasHeader) {
            panelHeader = (
                <div className='panel-heading hbuilt clearfix'>
                    <div className='pull-right'>{btns}</div>
                    <div className='heading-buttons'>
                        {this.props.title}
                    </div>
                </div>
            );
        }

        return (
            <div className={'hpanel ' + this.props.classHeader}>
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
    hasHeader: React.PropTypes.bool,
    btnsHeader: React.PropTypes.array,
    title: React.PropTypes.string,
    classHeader: React.PropTypes.string,
    error: React.PropTypes.element,
    children: React.PropTypes.any
};

Panel.defaultProps = {
    hasHeader: true,
    btnsHeader: [],
    title: '',
    error: null,
    classHeader: ''
};
