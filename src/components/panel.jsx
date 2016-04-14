import React from 'react';
import Button from './button.jsx';

export default class Panel extends React.Component {
    render() {
        const btns = this.props.btnsHeader.map((btn, i) => {
            return (
                <Button
                    btnAttrs={btn.props}
                    key={i}
                >
                    {btn.label}
                </Button>
            );
        });

        return (
            <div className='hpanel'>
                <div className='panel-heading hbuilt clearfix'>
                    <div className='pull-right'>{btns}</div>
                    <div className='heading-buttons'>
                        {this.props.title}
                    </div>
                </div>
                <div className='panel-body'>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

Panel.propTypes = {
    btnsHeader: React.PropTypes.array,
    title: React.PropTypes.string,
    children: React.PropTypes.any
};

Panel.defaultProps = {
    btnsHeader: [],
    title: ''
};
