import React from 'react';
import Link from './link.jsx';

export default class Pagination extends React.Component {
    render() {
        return (
            <div
                className={this.props.classes}
                id={this.props.id}
            >
                <ul className={this.props.ulClasses}>
                    {this.props.linksArray.map((link, i) => {
                        return (
                          <Link
                              key={i}
                              url={link.url}
                              label={link.label}
                              attrs={link.props}
                          />
                        );
                    })}
                </ul>
            </div>
        );
    }
}

Pagination.propTypes = {
    classes: React.PropTypes.string,
    id: React.PropTypes.string,
    ulClasses: React.PropTypes.string,
    linksArray: React.PropTypes.array
};

Pagination.defaultProps = {
    classes: '',
    id: 'pagination',
    ulClasses: 'pagination',
    linksArray: []
};
