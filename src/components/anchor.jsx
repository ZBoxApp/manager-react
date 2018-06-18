import React from 'react';
import PropTypes from 'prop-types';

export default class Anchor extends React.Component {
    render() {
        return (
            <li {...this.props.attrs}>
                <a href={this.props.url}>
                    <span className='nav-label'>
                        {this.props.label}
                    </span>
                </a>
            </li>
        );
    }
}

Anchor.propTypes = {
    badgeName: PropTypes.string,
    isBadge: PropTypes.bool,
    badgeClass: PropTypes.string,
    url: PropTypes.string,
    label: PropTypes.string,
    attrs: PropTypes.object
};

Anchor.defaultProps = {
    badgeName: '',
    isBadge: false,
    badgeClass: '',
    url: '#!',
    label: '',
    attrs: {}
};
