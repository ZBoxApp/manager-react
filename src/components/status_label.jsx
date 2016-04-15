import React from 'react';

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
