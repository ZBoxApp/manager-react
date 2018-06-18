import React from 'react';
import PropTypes from 'prop-types';
import Button from '../button.jsx';
import DateTimeField from 'react-bootstrap-datetimepicker';
import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';
import Constants from '../../utils/constants.jsx';
import moment from 'moment';

import * as GlobalActions from '../../action_creators/global_actions.jsx';

import MailboxStore from '../../stores/mailbox_store.jsx';

const messageType = Constants.MessageType;

export default class FormVacacionesMailbox extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.getOwnInitialState(props);
        this.handleSaveAutoResp = this.handleSaveAutoResp.bind(this);

        this.domain_id = this.props.domainId || null;
    }

    handleChange(timestamp, fieldName) {
        this.setState({
            [fieldName]: timestamp
        });
    }

    handleSaveAutoResp() {
        const { id: accountId } = this.props.data;
        const {zimbraPrefOutOfOfficeFromDate, zimbraPrefOutOfOfficeUntilDate, zimbraPrefOutOfOfficeReply, zimbraPrefOutOfOfficeReplyEnabled} = this.state;
        const isEnabled = zimbraPrefOutOfOfficeReplyEnabled;

        const startTs = Utils.stringTSToNumber(zimbraPrefOutOfOfficeFromDate);
        const endTs = Utils.stringTSToNumber(zimbraPrefOutOfOfficeUntilDate);
        const message = zimbraPrefOutOfOfficeReply && zimbraPrefOutOfOfficeReply.trim();

        const attrs = {
            zimbraPrefOutOfOfficeReplyEnabled: isEnabled.toString().toUpperCase()
        };

        if (isEnabled) {
            if (startTs > endTs) {
                return GlobalActions.emitMessage({
                    error: 'La fecha en la que termina su respuesta automática, debe ser mayor que en la que comienza.',
                    typeError: messageType.ERROR
                });
            }

            if (startTs === endTs) {
                return GlobalActions.emitMessage({
                    error: 'La fecha en la que comienza su respuesta automática no puede ser la misma fecha con la que termina.',
                    typeError: messageType.ERROR
                });
            }

            if (!message || message.length === 0) {
                return GlobalActions.emitMessage({
                    error: 'Debe ingresar su mensaje de respuesta automática.',
                    typeError: messageType.ERROR
                });
            }

            // add message to payload to be sent to zimbra server
            attrs.zimbraPrefOutOfOfficeReply = message;

            // get uct date string from timestamp
            const uctDateStart = Utils.timestampToUTCDate(zimbraPrefOutOfOfficeFromDate);
            const uctDateEnd = Utils.timestampToUTCDate(zimbraPrefOutOfOfficeUntilDate);

            attrs.zimbraPrefOutOfOfficeFromDate = uctDateStart;
            attrs.zimbraPrefOutOfOfficeUntilDate = uctDateEnd;
        }

        Client.modifyAccount(accountId, attrs, (mailbox) => {
            MailboxStore.updateMailbox(accountId, mailbox, this.domain_id);
            GlobalActions.emitMessage({
                error: 'Se ha modificado su respuesta de vacaciones con éxito.',
                typeError: messageType.SUCCESS
            });
        }, (error) => {
            GlobalActions.emitMessage({
                error: error.message,
                typeError: messageType.ERROR
            });
        });
    }

    getOwnInitialState(props) {
        const { data } = props;
        const { attrs } = data;

        const zimbraPrefOutOfOfficeFromDate = Utils.getTSFromUTC(Utils.getUTCTime(attrs.zimbraPrefOutOfOfficeFromDate));
        const zimbraPrefOutOfOfficeUntilDate = Utils.getTSFromUTC(Utils.getUTCTime(attrs.zimbraPrefOutOfOfficeUntilDate));

        const nextState = {
            zimbraPrefOutOfOfficeReplyEnabled: Utils.parseBooleanValue(attrs.zimbraPrefOutOfOfficeReplyEnabled),
            zimbraPrefOutOfOfficeReply: attrs.zimbraPrefOutOfOfficeReply,
            zimbraPrefOutOfOfficeFromDate,
            zimbraPrefOutOfOfficeUntilDate
        };

        return nextState;
    }

    render() {
        const {zimbraPrefOutOfOfficeFromDate, zimbraPrefOutOfOfficeReply, zimbraPrefOutOfOfficeUntilDate, zimbraPrefOutOfOfficeReplyEnabled} = this.state;

        return (
            <form
                className='simple_form form-horizontal mailbox-form'
                onSubmit={(e) => {
                    this.handleSubmit(e);
                }}
                id='resp-vacations'
            >
                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Habilitado'}
                    </label>

                    <div className='col-sm-8'>
                        <label className='radio-inline pretty-input'>
                            <div className='pretty-checkbox'>
                                <input
                                    checked={zimbraPrefOutOfOfficeReplyEnabled}
                                    onChange={({ target: { checked, name } }) => this.handleChange(checked, name)}
                                    type='checkbox'
                                    className='pretty'
                                    name={'zimbraPrefOutOfOfficeReplyEnabled'}
                                />
                                <span></span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Empieza el'}
                    </label>

                    <div className='col-sm-8'>
                        <DateTimeField
                            inputFormat='DD/MM/YYYY'
                            inputProps={
                                {
                                    readOnly: 'readOnly'
                                }
                            }
                            onChange={(timestamp) => {
                                this.handleChange(timestamp, 'zimbraPrefOutOfOfficeFromDate');
                            }}
                            minDate={moment()}
                            dateTime={zimbraPrefOutOfOfficeFromDate}
                            value={zimbraPrefOutOfOfficeFromDate}
                            mode={'date'}
                            showToday={true}
                        />
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Termina el'}
                    </label>

                    <div className='col-sm-8'>
                        <DateTimeField
                            inputFormat='DD/MM/YYYY'
                            inputProps={
                                {
                                    readOnly: 'readOnly'
                                }
                            }
                            onChange={(timestamp) => {
                                this.handleChange(timestamp, 'zimbraPrefOutOfOfficeUntilDate');
                            }}
                            minDate={moment()}
                            dateTime={zimbraPrefOutOfOfficeUntilDate}
                            value={zimbraPrefOutOfOfficeUntilDate}
                            mode={'date'}
                        />
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Respuesta'}
                    </label>

                    <div className='col-sm-8'>
                        <textarea
                            id='responseBox'
                            className='form-control'
                            rows='4'
                            value={zimbraPrefOutOfOfficeReply}
                            name={'zimbraPrefOutOfOfficeReply'}
                            onChange={({ target: { name, value } }) => this.handleChange(value, name)}
                        >
                        </textarea>
                    </div>
                </div>

                <div className='form-group'>
                    <div className='col-xs-8 col-sm-offset-2'>
                        <Button
                            btnAttrs={
                                {
                                    className: 'btn btn-info',
                                    onClick: () => {
                                        this.handleSaveAutoResp();
                                    }
                                }
                            }
                        >
                            {'Guardar'}
                        </Button>
                    </div>
                </div>
            </form>
        );
    }
}

FormVacacionesMailbox.propTypes = {
    data: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.string
    ]),
    domainId: PropTypes.string
};
