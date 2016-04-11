//import select2 from 'select2';
import $ from 'jquery';
import React from 'react';
import Panel from '../panel.jsx';
import Button from '../button.jsx';
import MessageBar from '../message_bar.jsx';

import * as Client from '../../utils/client.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import * as Utils from '../../utils/utils.jsx';

export default class EditMailBox extends React.Component {
    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleRadioChanged = this.handleRadioChanged.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.getMailbox = this.getMailbox.bind(this);
        this.fillForm = this.fillForm.bind(this);

        this.state = {
            data: false
        };
    }

    handleRadioChanged(val) {
        this.refs.plan.value = val;
    }

    handleEdit(e) {
        e.preventDefault();
        Utils.toggleStatusButtons('.action-button', true);

        Utils.validateInputRequired(this.refs).then(() => {
            let isAdmin = (this.refs.zimbraIsDelegatedAdminAccount.checked === true).toString().toUpperCase();
            let attrs = {
                givenName: this.refs.givenName.value,
                sn: this.refs.sn.value,
                zimbraIsDelegatedAdminAccount: isAdmin
            };

            Client.modifyAccount(
                this.state.data.id,
                attrs,
                (data) => {
                    Utils.toggleStatusButtons('.action-button', false);
                    this.setState(
                        {
                            error: `Su cuenta ${data.name} ha sido modificada con èxito.`,
                            typeError: 'success',
                            data: data
                        }
                    );
                },
                (error) => {
                    this.setState(
                        {
                            error: error.message,
                            typeError: 'warning'
                        }
                    );
                    Utils.toggleStatusButtons('.action-button', false);
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
            Utils.toggleStatusButtons('.action-button', false);
        });
    }

    getMailbox(id) {
        Client.getAccount(
            id,
            (data) => {
                this.setState({
                    data
                });
                GlobalActions.emitEndLoading();
            },
            (error) => {
                this.setState({
                    error: error.message
                });
                GlobalActions.emitEndLoading();
            }
        );
    }

    componentDidMount() {
        $('#sidebar-mailboxes').addClass('active');
        GlobalActions.emitEndLoading();
        this.getMailbox(this.props.params.id);
    }

    componentWillUnmount() {
        $('#sidebar-mailboxes').removeClass('active');
    }

    handleDelete(e) {
        e.preventDefault();

        Client.removeAccount(
            this.state.data.id,
            (data) => {
                console.log('success', data); //eslint-disable-line no-console
            },
            (error) => {
                console.log('error', error); //eslint-disable-line no-console
            }
        );
    }

    fillForm() {
        let attrs = this.state.data.attrs;
        this.refs.mail.value = this.state.data.name;
        this.refs.givenName.value = attrs.givenName || '';
        this.refs.sn.value = attrs.sn;
        this.refs.description.value = attrs.description || '';
        this.refs.zimbraIsDelegatedAdminAccount.checked = attrs.zimbraIsDelegatedAdminAccount === 'true';
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

        if (this.state.data) {
            this.fillForm();
        }
        let form = (
            <form
                className='simple_form form-horizontal mailbox-form'
                id='editAccount'
                onSubmit={(e) => {
                    this.handleEdit(e);
                }}
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
                                    data-message='El campo direccion es requerido, verifique por favor.'
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
                                    onChange={() => {
                                        this.handleRadioChanged('basica');
                                    }}
                                />
                                <span></span>
                            </div>
                            {'Básica'}
                        </label>

                        <label className='radio radio-info radio-inline pretty-input'>
                            <div className='pretty-radio'>
                                <input
                                    className='pretty'
                                    name='mailbox'
                                    type='radio'
                                    onChange={() => {
                                        this.handleRadioChanged('profesional');
                                    }}
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
                                    onChange={() => {
                                        this.handleRadioChanged('premium');
                                    }}
                                />
                                <span></span>
                            </div>
                            {'Premium'}
                        </label>

                        <input
                            type='hidden'
                            ref='plan'
                            data-required='true'
                            data-message='El plan de su cuenta es requerido, por favor verificar.'
                        />
                    </div>
                </div>

                <div className='form-group'>
                    <div className='col-sm-8 col-sm-offset-3'>
                        <input
                            type='submit'
                            name='commit'
                            value='Guardar'
                            className='btn btn-primary action-button'
                            id='modifyButton'
                        />
                        <Button
                            btnAttrs={
                            {
                                className: 'btn btn-default action-button',
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
                    className: 'btn btn-default btn-xs action-button',
                    onClick: (e) => {
                        Utils.handleLink(e, '/mailboxes', this.props.location);
                    }
                }
            },
            {
                label: 'Eliminar',
                props: {
                    className: 'btn btn-danger btn-xs action-button',
                    onClick: (e) => {
                        this.handleDelete(e);
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
                                title={'Editar Casilla'}
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

EditMailBox.propTypes = {
    location: React.PropTypes.object,
    params: React.PropTypes.any
};
