import React from 'react';

export default class Label extends React.Component {
    render() {
        return (
            <span className={this.props.classes}>
                {this.props.children}
            </span>
        );
    }
}

Label.propTypes = {
    classes: React.PropTypes.string,
    children: React.PropTypes.any
};

Label.defaultProps = {
    classes: '',
    children: ''
};
