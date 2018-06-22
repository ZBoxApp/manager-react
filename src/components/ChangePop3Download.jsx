import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DateTimeField from 'react-bootstrap-datetimepicker';
import { getTSFromUTC, timestampToUTCDate } from '../utils/utils.jsx';
import Button from './button.jsx';
import { modifyAccount } from '../utils/client.jsx';
import * as GlobalActions from '../action_creators/global_actions.jsx';
import Constants from '../utils/constants.jsx';
const messageType = Constants.MessageType;

export default class Pop3DownloadSinceField extends Component {
    static propTypes = {
        since: PropTypes.string,
        accountId: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.state = this.getInitState(props);
        this.onChange = this.onChange.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onClear = this.onClear.bind(this);
        this.setLoading = this.setLoading.bind(this);
    }

    getInitState(props) {
        const { since } = props;

        return {
            loading: false,
            zimbraPrefPop3DownloadSince: this.parseUTCTime(since) || ''
        };
    }

    onChange(ts) {
        this.setState({
            zimbraPrefPop3DownloadSince: ts
        });
    }

    onClear(e) {
        e.preventDefault();
        this.setState({
            zimbraPrefPop3DownloadSince: ''
        }, () => {
            this.onSave();
        });
    }

    setLoading(isLoading) {
        this.setState({ loading: isLoading });
    }

    onSave(e) {
        if (e) {
            e.preventDefault();
        }
        this.setLoading(true);
        const { accountId } = this.props;
        const { zimbraPrefPop3DownloadSince } = this.state;

        const attribute = {
            zimbraPrefPop3DownloadSince: zimbraPrefPop3DownloadSince ? timestampToUTCDate(zimbraPrefPop3DownloadSince) : ''
        };

        modifyAccount(accountId, attribute, () => {
            GlobalActions.emitMessage({
                error: 'Se ha modificado la fecha de descargar de POP3 éxitosamente.',
                typeError: messageType.SUCCESS
            });
            this.setLoading(false);
        }, (error) => {
            GlobalActions.emitMessage({
                error: error.message,
                typeError: error.typeError
            });
            this.setLoading(false);
        });
    }

    parseUTCTime(time) {
        if (!time) {
            return '';
        }

        return getTSFromUTC(time);
    }

    render() {
        const { zimbraPrefPop3DownloadSince, loading } = this.state;

        const attrs = {};

        if (zimbraPrefPop3DownloadSince === '' || typeof zimbraPrefPop3DownloadSince === 'undefined') {
            attrs.defaultText = 'Ingresa tu fecha';
        } else {
            attrs.dateTime = zimbraPrefPop3DownloadSince;
        }

        return (
            <div style={{ border: '1px solid #e4e5e7', padding: 10 }}>
                <div>
                    <strong>
                        {'Descargar correo POP3 desde:'}
                    </strong>
                </div>

                <DateTimeField
                    inputFormat='DD/MM/YYYY'
                    inputProps={
                        {
                            readOnly: 'readOnly'
                        }
                    }
                    onChange={this.onChange}
                    mode={'datetime'}
                    showToday={true}
                    {...attrs}
                />

                <div style={{ marginTop: 10, textAlign: 'right' }}>
                    <Button
                        btnAttrs={{
                            className: 'btn btn-xs btn-info action-info-btns',
                            onClick: this.onSave,
                            disabled: loading
                        }}
                    >
                        {loading ? 'Guardando...' : 'Gurardar'}
                    </Button>

                    <Button
                        btnAttrs={{
                            className: 'btn btn-xs btn-danger action-info-btns',
                            onClick: this.onClear,
                            disabled: loading
                        }}
                    >
                        {'Limpiar'}
                    </Button>
                </div>
            </div>
        );
    }
}
