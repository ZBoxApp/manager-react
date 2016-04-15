import React from 'react';

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
    badgeName: React.PropTypes.string,
    isBadge: React.PropTypes.bool,
    badgeClass: React.PropTypes.string,
    url: React.PropTypes.string,
    label: React.PropTypes.string,
    attrs: React.PropTypes.object
};

Anchor.defaultProps = {
    badgeName: '',
    isBadge: false,
    badgeClass: '',
    url: '#!',
    label: '',
    attrs: {}
};
