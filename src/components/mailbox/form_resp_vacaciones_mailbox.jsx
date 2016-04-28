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
    }

    handleSaveAutoResp() {
        const data = this.props.data;
        const refs = this.refs;
        let enabled = refs.zimbraPrefOutOfOfficeReplyEnabled.checked.toString().toUpperCase();
        let formated = document.getElementById('zimbraPrefOutOfOfficeUntilDate').value.split('/').reverse().join('') + '000000Z';

        let attrs = {
            zimbraPrefOutOfOfficeReplyEnabled: enabled,
            zimbraPrefOutOfOfficeUntilDate: formated,
            zimbraPrefOutOfOfficeReply: refs.zimbraPrefOutOfOfficeReply.value
        };

        Client.modifyAccount(data.id, attrs, () => {
            GlobalActions.emitMessage({
                error: 'Se ha modificado su respuesta de vacaciones con éxito.',
                type: messageType.SUCCESS
            });
        }, (error) => {
            GlobalActions.emitMessage({
                error: error.message,
                type: messageType.ERROR
            });
        });
    }

    componentDidMount() {
        const data = this.props.data.attrs;
        if (data.hasOwnProperty('zimbraPrefOutOfOfficeReplyEnabled')) {
            this.refs.zimbraPrefOutOfOfficeReplyEnabled.checked = data.zimbraPrefOutOfOfficeReplyEnabled.toString().toLowerCase() === 'true';
        }

        if (data.hasOwnProperty('zimbraPrefOutOfOfficeUntilDate')) {
            document.getElementById('zimbraPrefOutOfOfficeUntilDate').value = Utils.dateFormatted(data.zimbraPrefOutOfOfficeUntilDate, true, '/');
        }

        if (data.hasOwnProperty('zimbraPrefOutOfOfficeReply')) {
            this.refs.zimbraPrefOutOfOfficeReply.value = data.zimbraPrefOutOfOfficeReply;
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
