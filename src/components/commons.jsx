import React, { Component } from 'react';
import PropTypes from 'prop-types';
import StatusLabelComp from './status_label.jsx';
import { normalizeAccountName } from '../utils/utils.jsx';
import Spinner from './spinner.jsx';
import Button from './button.jsx';

// map all status for accounts
export const classByStatus = {
    active: {
        className: 'label label-success m-r',
        label: 'Activa'
    },
    closed: {
        className: 'label label-default m-r',
        label: 'Cerrada'
    },
    locked: {
        className: 'label label-warning m-r',
        label: 'Inactiva'
    },
    lockout: {
        className: 'label label-locked m-r',
        label: 'Bloqueada'
    },
    unknown: {
        className: 'label-plan label-unknown',
        label: 'Desconocido'
    }
};

export const StatusLabel = ({ status }) => {
    const labelObject = classByStatus[status] || classByStatus.unknown;
    const { className, label } = labelObject;

    return (
        <StatusLabelComp
            classes={className}
            children={label}
        />
    );
};

StatusLabel.propTypes = {
    status: PropTypes.string
};

export const DisplayAccountName = ({ account }) => {
    const { attrs } = account;
    const { displayName, givenName, cn, sn } = (attrs || {});

    return (
        <span>
            {normalizeAccountName(displayName, givenName, cn, sn)}
        </span>
    );
};

DisplayAccountName.propTypes = {
    account: PropTypes.object
};

export class ExportButton extends Component {
    static propTypes = {
        onExport: PropTypes.func,
        onSuccess: PropTypes.func,
        onError: PropTypes.func,
        children: PropTypes.node
    };

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            items: []
        };

        this.onExport = this.onExport.bind(this);
    }

    onExport() {
        const { onExport, onSuccess, onError } = this.props;
        const { loading } = this.state;

        if (loading) {
            return;
        }

        if (typeof onExport === 'function') {
            this.setState({ loading: true });
            onExport().then(onSuccess).catch(onError).finally(() => this.setState({ loading: false }));
        }
    }

    render() {
        const { loading } = this.state;
        const { children } = this.props;

        return (
            <span>
                <span style={{ display: 'inline-block', marginRight: 10 }}>
                    <Spinner
                        loading={loading}
                        size={'1'}
                        placeholder={''}
                    />
                </span>
                <Button btnAttrs={{ onClick: this.onExport, disabled: loading, className: 'btn btn-default m-r' }} >
                    {children}
                </Button>
            </span>
        );
    }
}
