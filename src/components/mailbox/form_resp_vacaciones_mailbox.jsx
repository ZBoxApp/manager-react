import React from 'react';
import Button from '../button.jsx';
import DateTimeField from 'react-bootstrap-datetimepicker';
import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';
import Constants from '../../utils/constants.jsx';

import * as GlobalActions from '../../action_creators/global_actions.jsx';

const messageType = Constants.MessageType;

export default class FormVacacionesMailbox extends React.Component {
    constructor(props) {
        super(props);

        this.handleSaveAutoResp = this.handleSaveAutoResp.bind(this);

        this.dateStart = null;
        this.dateEnd = null;
        this.initialDate = Utils.setInitialDate();
    }

    handleChangeDate(x, from) {
        const ref = this.refs[from];
        const timestamp = Utils.getInitialDateFromTimestamp(x);

        ref.value = timestamp;
    }

    handleSaveAutoResp() {
        const data = this.props.data;
        const refs = this.refs;
        const attrs = {};
        const isEnabled = refs.zimbraPrefOutOfOfficeReplyEnabled.checked;
        const start = refs.zimbraPrefOutOfOfficeFromDate.value;
        const end = refs.zimbraPrefOutOfOfficeUntilDate.value;
        let formatedStart = document.getElementById('zimbraPrefOutOfOfficeFromDate').value.split('/').reverse().join('') + '000000Z';
        let formatedEnd = document.getElementById('zimbraPrefOutOfOfficeUntilDate').value.split('/').reverse().join('') + '000000Z';

        if ((start > end) && isEnabled) {
            GlobalActions.emitMessage({
                error: 'La fecha en la que termina su respuesta automática, debe ser mayor que en la que comienza.',
                typeError: messageType.ERROR
            });

            return false;
        } else if ((start === end) && isEnabled) {
            GlobalActions.emitMessage({
                error: 'La fecha en la que comienza su respuesta automática no puede ser la misma fecha en la que termina.',
                typeError: messageType.ERROR
            });

            return false;
        }

        if (isEnabled) {
            attrs.zimbraPrefOutOfOfficeReplyEnabled = isEnabled.toString().toUpperCase();
            attrs.zimbraPrefOutOfOfficeReply = refs.zimbraPrefOutOfOfficeReply.value;
            attrs.zimbraPrefOutOfOfficeUntilDate = formatedEnd;
            attrs.zimbraPrefOutOfOfficeFromDate = formatedStart;
        } else {
            attrs.zimbraPrefOutOfOfficeReplyEnabled = isEnabled.toString().toUpperCase();
        }

        Client.modifyAccount(data.id, attrs, () => {
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

        return null;
    }

    componentDidMount() {
        const data = this.props.data.attrs;

        if (data.hasOwnProperty('zimbraPrefOutOfOfficeReplyEnabled')) {
            this.refs.zimbraPrefOutOfOfficeReplyEnabled.checked = data.zimbraPrefOutOfOfficeReplyEnabled.toString().toLowerCase() === 'true';
        }

        if (data.hasOwnProperty('zimbraPrefOutOfOfficeReply')) {
            this.refs.zimbraPrefOutOfOfficeReply.value = data.zimbraPrefOutOfOfficeReply;
        }

        if (this.dateStart) {
            this.refs.zimbraPrefOutOfOfficeFromDate.value = Utils.forceTimestampFromHumanDate(this.dateStart);
        }

        if (this.dateEnd) {
            this.refs.zimbraPrefOutOfOfficeUntilDate.value = Utils.forceTimestampFromHumanDate(this.dateEnd);
        }
    }

    componentWillMount() {
        const data = this.props.data.attrs;

        if (data.hasOwnProperty('zimbraPrefOutOfOfficeFromDate')) {
            this.dateStart = Utils.dateFormatted(data.zimbraPrefOutOfOfficeFromDate, true, '/');
        } else {
            this.dateStart = this.initialDate.formatted;
        }

        if (data.hasOwnProperty('zimbraPrefOutOfOfficeUntilDate')) {
            this.dateEnd = Utils.dateFormatted(data.zimbraPrefOutOfOfficeUntilDate, true, '/');
        } else {
            this.dateEnd = this.initialDate.formatted;
        }
    }

    render() {
        return (
            <form
                className='simple_form form-horizontal mailbox-form'
                onSubmit={(e) => {
                    this.handleSubmit(e);
                }}
                id='createAccount'
            >
                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Habilitado'}
                    </label>

                    <div className='col-sm-8'>
                        <label className='radio-inline pretty-input'>
                            <div className='pretty-checkbox'>
                                <input
                                    type='checkbox'
                                    className='pretty'
                                    ref='zimbraPrefOutOfOfficeReplyEnabled'
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
                                    id: 'zimbraPrefOutOfOfficeFromDate',
                                    readOnly: 'readOnly'
                                }
                            }
                            onChange={(x) => {
                                this.handleChangeDate(x, 'zimbraPrefOutOfOfficeFromDate');
                            }}
                            defaultText={this.dateStart}
                            mode={'date'}
                        />
                        <input
                            type='hidden'
                            ref='zimbraPrefOutOfOfficeFromDate'
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
                                    id: 'zimbraPrefOutOfOfficeUntilDate',
                                    readOnly: 'readOnly'
                                }
                            }
                            onChange={(x) => {
                                this.handleChangeDate(x, 'zimbraPrefOutOfOfficeUntilDate');
                            }}
                            defaultText={this.dateEnd}
                            mode={'date'}
                        />

                        <input
                            type='hidden'
                            ref='zimbraPrefOutOfOfficeUntilDate'
                        />
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Respuesta'}
                    </label>

                    <div className='col-sm-8'>
                        <textarea
                            name='response'
                            id='responseBox'
                            className='form-control'
                            rows='4'
                            ref='zimbraPrefOutOfOfficeReply'
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
    data: React.PropTypes.oneOfType([
        React.PropTypes.object,
        React.PropTypes.string
    ])
};
