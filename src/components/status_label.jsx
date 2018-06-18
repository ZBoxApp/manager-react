import React from 'react';
import PropTypes from 'prop-types';

// Cambiar por algo que reciba el status y el tamaño y se cree el componente de una vez
export default class StatusLabel extends React.Component {
    render() {
        return (
            <span className={this.props.classes}>
                {this.props.children}
            </span>
        );
    }
}

StatusLabel.propTypes = {
    classes: PropTypes.string,
    children: PropTypes.any
};

StatusLabel.defaultProps = {
    classes: '',
    children: ''
};
