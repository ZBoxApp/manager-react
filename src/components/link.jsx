import React from 'react';
import If from './if.jsx';

export default class Link extends React.Component {
    render() {
        return (
            <li {...this.props.attrs}>
                <a href={this.props.url}>
                    <span className='nav-label'>
                        {this.props.label}
                    </span>
                    <If condition={this.props.isBadge}>
                        <span className={this.props.badgeClass}>
                            {this.props.badgeName}
                        </span>
                    </If>
                </a>
            </li>
        );
    }
}

Link.propTypes = {
    badgeName: React.PropTypes.string,
    isBadge: React.PropTypes.bool,
    badgeClass: React.PropTypes.string,
    url: React.PropTypes.string,
    label: React.PropTypes.string,
    attrs: React.PropTypes.object
};

Link.defaultProps = {
    badgeName: '',
    isBadge: false,
    badgeClass: '',
    url: '#!',
    label: '',
    attrs: {}
};
