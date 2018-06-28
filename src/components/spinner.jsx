import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Spinner extends Component {
    static defaultProps = {
        placeholder: 'Cargando...',
        size: '4'
    };

    static propTypes = {
        children: PropTypes.element,
        placeholder: PropTypes.string,
        loading: PropTypes.bool,
        size: PropTypes.string
    };

    render() {
        const { children, placeholder, loading, size } = this.props;
        const className = loading ? 'spinner-shown' : 'spinner-hide';

        return (
            <div
                className='spinner-container'
                key={'mailboxes-loading'}
            >
                <div className={`spinner-layer ${className}`}>
                    <div className={'loader-layer text-center'}>
                        <i className={`fa fa-spinner fa-spin fa-${size}x fa-fw`}></i>
                        <p>{placeholder}</p>
                    </div>
                </div>
                <div>
                    {children}
                </div>
            </div>
        );
    }
}
