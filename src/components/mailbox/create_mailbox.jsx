import $ from 'jquery';
import React from 'react';
import Panel from '../panel.jsx';
import Button from '../button.jsx';
import MessageBar from '../message_bar.jsx';

import * as GlobalActions from '../../action_creators/global_actions.jsx';
import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';

import Constants from '../../utils/constants.jsx';

const messageType = Constants.MessageType;

export default class CreateMailBox extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {};
    }

    handleSubmit(e) {
        e.preventDefault();

        Utils.validateInputRequired(this.refs).then(() => {
            // here assign missing properties.
            let attrs = {
                givenName: this.refs.givenName.value,
                sn: this.refs.sn.value
            };

            Client.createAccount(
                this.refs.mail.value,
                this.refs.mail.passwd,
                attrs,
                (data) => {
                    // reset form when all is ok
                    document.getElementById('createAccount').reset();
                    this.setState(
                        {
                            error: `Su cuenta ${data.name} ha sido creada con èxito.`,
                            typeError: messageType.SUCCESS
                        }
                    );
                },
                (error) => {
                    this.setState(
                        {
                            error: error.message,
                            typeError: messageType.WARNING
                        }
                    );
                }
            );
        }).catch((err) => {
            this.setState(
                {
                    error: err.message,
                    typeError: err.typeError
                }
            );

            err.node.focus();
        });
    }

    componentDidMount() {
        /*$('#selectDomains').select2({
            placeholder: 'Por favor, introduzca 3 caracteres.',
            allowClear: true
        });*/

        $('#passwdMeter').pwstrength();

        $('#sidebar-mailboxes').addClass('active');
        GlobalActions.emitEndLoading();
    }

    componentWillUnmount() {
        $('#sidebar-mailboxes').removeClass('active');
    }

    render() {
        let message;
        if (this.state.error) {
            message = (
                <MessageBar
                    message={this.state.error}
                    type={this.state.typeError}
                    autoclose={true}
                />
            );
        }

        let form = (
            <form
                className='simple_form form-horizontal mailbox-form'
                onSubmit={(e) => {
                    this.handleSubmit(e);
                }}
                id='createAccount'
            >
                <div className='form-group string required'>
                    <label className='string required col-sm-3 control-label'>
                        <abbr title='requerido'>{'*'}</abbr>
                        {'Dirección'}
                    </label>

                    <div className='col-sm-8'>
                        <div className='row'>
                            <div className='col-xs-6'>
                                <input
                                    type='text'
                                    className='form-control'
                                    ref='mail'
                                    data-required='true'
                                />
                            </div>
                            <div className='col-xs-6'>
                                <div className='input-group'>
                                    <span className='input-group-addon'>{'@'}</span>
                                    <select
                                        className='form-control'
                                        id='selectDomains'
                                        ref='domain'
                                    >
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Nombre'}
                    </label>

                    <div className='col-sm-8'>
                        <input
                            type='text'
                            className='form-control'
                            ref='givenName'
                        />
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Apellido'}
                    </label>

                    <div className='col-sm-8'>
                        <input
                            type='text'
                            className='form-control'
                            ref='sn'
                        />
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Descripción'}
                    </label>

                    <div className='col-sm-8'>
                        <input
                            type='text'
                            className='form-control'
                            ref='description'
                        />
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Administrador delegado'}
                    </label>

                    <div className='col-sm-8'>
                        <label className='radio-inline pretty-input'>
                            <div className='pretty-checkbox'>
                                <input
                                    type='checkbox'
                                    className='pretty'
                                    ref='zimbraIsDelegatedAdminAccount'
                                />
                                <span></span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        <abbr title='Requerido'>{'*'}</abbr>
                        {'Tipo de casilla'}
                    </label>

                    <div className='col-sm-8'>
                        <label className='radio radio-info radio-inline pretty-input'>
                            <div className='pretty-radio'>
                                <input
                                    type='radio'
                                    className='pretty'
                                    name='mailbox'
                                    ref='mailbox_basic'
                                />
                                <span></span>
                            </div>
                            {'Básica'}
                        </label>

                        <label className='radio radio-info radio-inline pretty-input'>
                            <div className='pretty-radio'>
                                <input
                                    type='radio'
                                    className='pretty'
                                    name='mailbox'
                                    ref='mailbox_professional'
                                />
                                <span></span>
                            </div>
                            {'Profesional'}
                        </label>

                        <label className='radio radio-info radio-inline pretty-input'>
                            <div className='pretty-radio'>
                                <input
                                    type='radio'
                                    className='pretty'
                                    name='mailbox'
                                    ref='mailbox_premium'
                                />
                                <span></span>
                            </div>
                            {'Premium'}
                        </label>
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        <abbr title='Requerido'>{'*'}</abbr>
                        {'Contraseña'}
                    </label>

                    <div className='col-sm-8'>
                        <input
                            type='password'
                            className='form-control'
                            data-required='true'
                            ref='passwd'
                            id='passwdMeter'
                        />
                    </div>
                </div>

                <div className='form-group'>
                    <div className='col-sm-8 col-sm-offset-3'>
                        <input
                            type='submit'
                            name='commit'
                            value='Guardar'
                            className='btn btn-primary'
                        />
                        <Button
                            btnAttrs={
                            {
                                className: 'btn btn-default',
                                onClick: (e) => {
                                    Utils.handleLink(e, '/mailboxes', this.props.location);
                                }
                            }
                            }
                        >
                            {'Cancelar'}
                        </Button>
                    </div>
                </div>
            </form>
        );

        const actions = [
            {
                label: 'Cancelar',
                props: {
                    className: 'btn btn-default btn-xs',
                    onClick: (e) => {
                        Utils.handleLink(e, '/mailboxes', this.props.location);
                    }
                }
            }
        ];

        return (
            <div>
                {message}
                <div className='content animate-panel'>
                    <div className='row'>
                        <div className='col-md-12 central-content'>
                            <Panel
                                title={'Agregar Casilla'}
                                btnsHeader={actions}
                                classHeader={'forum-box'}
                            >
                                {form}
                            </Panel>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

CreateMailBox.propTypes = {
    location: React.PropTypes.object
};
