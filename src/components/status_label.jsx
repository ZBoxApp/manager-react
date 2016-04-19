import React from 'react';

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
    classes: React.PropTypes.string,
    children: React.PropTypes.any
};

StatusLabel.defaultProps = {
    classes: '',
    children: ''
};
