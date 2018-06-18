import React from 'react';
import PropTypes from 'prop-types';

export default class Button extends React.Component {
    render() {
        return (
            <a {...this.props.btnAttrs}>{this.props.children}</a>
        );
    }
}

Button.propTypes = {
    btnAttrs: PropTypes.object,
    children: PropTypes.any
};
