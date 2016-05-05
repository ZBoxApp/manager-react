import $ from 'jquery';
import React from 'react';
import Panel from '../panel.jsx';
import Button from '../button.jsx';
import MessageBar from '../message_bar.jsx';
import Promise from 'bluebird';

import DataList from 'react-datalist';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';
import EventStore from '../../stores/event_store.jsx';
import MailboxStore from '../../stores/mailbox_store.jsx';

import Constants from '../../utils/constants.jsx';

const messageType = Constants.MessageType;

export default class CreateMailBox extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.getAllDomains = this.getAllDomains.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.handleRadioChanged = this.handleRadioChanged.bind(this);
        this.controllerDataList = this.controllerDataList.bind(this);
        this.reset = null;

        this.state = {};
    }

    showMessage(attrs) {
        this.setState({
            error: attrs.message,
            typeError: attrs.typeError
        });
    }

    handleSubmit(e) {
        e.preventDefault();

        Utils.validateInputRequired(this.refs).then(() => {
            // here assign missing properties.
            const domain = document.querySelector('input[list=\'domain\']');

            if (domain.value === '') {
                GlobalActions.emitMessage({
                    message: 'El dominio es requerido, verifique por favor.',
                    typeError: messageType.ERROR
                });

                domain.focus();

                return false;
            }

            const email = this.refs.mail.value + '@' + domain.value;

            //falta campo de tipo de casilla
            const attrs = {
                givenName: this.refs.givenName.value,
                sn: this.refs.sn.value,
                description: this.refs.description.value,
                zimbraCOSId: this.refs.zimbraCOSId.value,
                zimbraAccountStatus: this.refs.zimbraAccountStatus.value
            };

            Client.createAccount(
                email,
                this.refs.passwd.value,
                attrs,
                (data) => {
                    // reset form when all is ok
                    document.getElementById('createAccount').reset();
                    this.reset.toggleOptions();

                    MailboxStore.setMailbox(data);

                    GlobalActions.emitMessage({
                        message: 'Se ha creado su cuenta con éxito.',
                        typeError: messageType.SUCCESS
                    });
                },
                (error) => {
                    GlobalActions.emitMessage({
                        message: error.message,
                        typeError: messageType.ERROR
                    });
                }
            );

            return true;
        }).catch((err) => {
            GlobalActions.emitMessage({
                message: err.message,
                typeError: messageType.ERROR
            });

            err.node.focus();
        });
    }

    handleRadioChanged(val) {
        this.refs.zimbraCOSId.value = val;
    }

    getAllDomains() {
        const promises = [];
        const max = 200;

        const doms = new Promise((resolve, reject) => {
            Client.getAllDomains(
                {
                    limit: max
                },
                (data) => {
                    resolve(data);
                },
                (error) => {
                    reject(error);
                }
            );
        });

        const cos = new Promise((resolve, reject) => {
            Client.getAllCos((success) => {
                resolve(success);
            }, (error) => {
                reject(error);
            });
        });

        promises.push(doms, cos);

        Promise.all(promises).then((success) => {
            const response = {};
            success.map((pos) => {
                if (Array.isArray(pos)) {
                    const arrPlans = Utils.getEnabledPlansByCos(pos);
                    response.plans = arrPlans;
                } else {
                    response.domains = pos;
                }
                return true;
            });

            this.setState(response);

            GlobalActions.emitEndLoading();

            Utils.toggleStatusButtons('.action-save', false);
        }, (error) => {
            GlobalActions.emitMessage({
                error: error.message,
                typeError: error.type
            });
            GlobalActions.emitEndLoading();
            Utils.toggleStatusButtons('.action-save', false);
        });
    }

    componentDidMount() {
        EventStore.addMessageListener(this.showMessage);
        Utils.toggleStatusButtons('.action-save', true);
        $('#sidebar-mailboxes').addClass('active');
        this.getAllDomains();
        GlobalActions.emitEndLoading();
    }

    componentWillUnmount() {
        EventStore.removeMessageListener(this.showMessage);
        $('#sidebar-mailboxes').removeClass('active');
    }

    controllerDataList(controller) {
        this.reset = controller;
    }

    render() {
        let message;
        let domains = [];
        let form = null;
        let checkboxes = [];

        if (this.state.error) {
            message = (
                <MessageBar
                    message={this.state.error}
                    type={this.state.typeError}
                    autoclose={true}
                />
            );
        }

        if (this.state.domains) {
            const object = this.state.domains.domain;
            const plans = this.state.plans;
            let limit = object.length;
            for (; limit-- > 0;) {
                domains.push(object[limit].name);
            }

            for (let plan in plans) {
                if (plans.hasOwnProperty(plan)) {
                    const item = (
                        <label
                            className='radio radio-info radio-inline pretty-input'
                            key={plan}
                        >
                            <div className='pretty-radio'>
                                <input
                                    type='radio'
                                    className='pretty'
                                    name='mailbox'
                                    onChange={() => {
                                        this.handleRadioChanged(plans[plan]);
                                    }}
                                />
                                <span></span>
                            </div>
                            {Utils.titleCase(plan)}
                        </label>
                    );
                    checkboxes.push(item);
                }
            }

            form = (
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
                                <div className='col-xs-12'>
                                    <div className='input-group'>
                                        <input
                                            type='text'
                                            className='form-control'
                                            ref='mail'
                                            data-required='true'
                                            data-message='El nombre de la casilla es requerida, verifique por favor.'
                                            placeholder='Mail'
                                        />
                                        <span className='input-group-addon'>{'@'}</span>
                                        <DataList
                                            list='domain'
                                            options={domains}
                                            className='form-control'
                                            placeholder='Dominio'
                                            getController={this.controllerDataList}
                                        />
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
                        <label className='string col-sm-3 control-label'>
                            {'Status'}
                        </label>

                        <div className='col-sm-8'>
                            <select
                                className='form-control'
                                ref='zimbraAccountStatus'
                            >
                                <option value='active'>Activa</option>
                                <option value='closed'>Cerrada</option>
                                <option value='locked'>Bloqueada</option>
                            </select>
                        </div>
                    </div>

                    <div className='form-group string'>
                        <label className='string required col-sm-3 control-label'>
                            <abbr title='Requerido'>{'*'}</abbr>
                            {'Tipo de casilla'}
                        </label>

                        <div className='col-sm-8'>

                            {checkboxes}

                            <input
                                type='hidden'
                                ref='zimbraCOSId'
                                data-required='true'
                                data-message='El plan de su casilla es requerido, por favor verificar.'
                            />
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
                                data-message='La contraseña de su casilla es requerida, verifique por favor.'
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
                                className='btn btn-primary action-save'
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
        }

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
                <div className='content animate-panel'>
                    {message}
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
