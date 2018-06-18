import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import Button from '../button.jsx';
import MessageBar from '../message_bar.jsx';
import Panel from '../panel.jsx';

import * as Client from '../../utils/client.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import * as Utils from '../../utils/utils.jsx';
import EventStore from '../../stores/event_store.jsx';
import Promise from 'bluebird';

import Constants from '../../utils/constants.jsx';

const messageType = Constants.MessageType;

export default class EditDistributionList extends React.Component {
    constructor(props) {
        super(props);

        this.showMessage = this.showMessage.bind(this);
        this.saveChanges = this.saveChanges.bind(this);

        this.state = {};
    }

    showMessage(attrs) {
        this.setState({
            error: attrs.error,
            type: attrs.typeError
        });
    }

    saveChanges(e) {
        e.preventDefault();
        Utils.toggleStatusButtons('.action-edit-dl', true);

        Utils.validateInputRequired(this.refs).then(() => {
            const id = this.props.params.id;
            const attrs = {};
            const mail = this.refs.mail.value;

            attrs.displayName = this.refs.displayName.value;

            Client.modifyDistributionList(id, attrs, (dl) => {
                const domain = dl.name.split('@').pop();
                const newNameDL = `${mail}@${domain}`;
                dl.rename(newNameDL, (err) => {
                    Utils.toggleStatusButtons('.action-edit-dl', false);

                    if (err) {
                        return GlobalActions.emitMessage({
                            error: err.extra.reason,
                            typeError: messageType.ERROR
                        });
                    }

                    return GlobalActions.emitMessage({
                        error: 'Se han actualizado sus datos éxitosamente.',
                        typeError: messageType.SUCCESS
                    });
                });
            }, (err) => {
                GlobalActions.emitMessage({
                    error: err.message,
                    typeError: messageType.ERROR
                });
                Utils.toggleStatusButtons('.action-edit-dl', false);
            });
        }).catch((error) => {
            GlobalActions.emitMessage({
                error: error.message,
                type: messageType.ERROR
            });

            error.node.focus();
            Utils.toggleStatusButtons('.action-edit-dl', false);
        });
    }

    getDistributionList() {
        const id = this.props.params.id;

        new Promise((resolve, reject) => {
            Client.getDistributionList(id, (success) => {
                resolve(success);
            }, (error) => {
                reject(error);
            });
        }).then((res) => {
            const domain = this.refs.domain;
            const displayName = this.refs.displayName;
            const mail = this.refs.mail;

            const dl = res.name.split('@');

            domain.innerHTML = dl.pop();
            if (res.attrs.displayName) {
                displayName.value = res.attrs.displayName;
            }
            mail.value = dl.shift();
        }).catch((err) => {
            GlobalActions.emitMessage({
                error: err.message,
                type: messageType.ERROR
            });
            Utils.toggleStatusButtons('.action-edit-dl', true);
        }).finally(() => {
            GlobalActions.emitEndLoading();
        });
    }

    componentDidMount() {
        EventStore.addMessageListener(this.showMessage);
        GlobalActions.emitEndLoading();
        $('#sidebar-domain').removeClass('active');
        this.getDistributionList();
    }

    componentWillUnmount() {
        EventStore.removeMessageListener(this.showMessage);
        $('#sidebar-domain').removeClass('active');
    }

    render() {
        let message;
        let form;
        let actions;
        if (this.state.error) {
            message = (
                <MessageBar
                    message={this.state.error}
                    type={this.state.type}
                    autoclose={true}
                />
            );
        }

        form = (
            <form
                className='simple_form form-horizontal mailbox-form'
                id='editAccount'
            >
                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        <abbr title='requerido'>{'*'}</abbr>
                        {'Dirección'}
                    </label>

                    <div className='col-sm-8'>
                        <div className='input-group'>
                            <input
                                type='text'
                                className='form-control'
                                ref='mail'
                                data-required='true'
                                data-message='La dirección de correo es requerida, por favor verifique.'
                                placeholder='Dirección'
                            />
                            <span
                                className='input-group-addon'
                                ref='domain'
                            >
                            </span>
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
                            ref='displayName'
                            placeholder='Nombre mostrado en contactos'
                        />
                    </div>
                </div>

                <div className='form-group'>
                    <div className='col-sm-3'></div>
                    <div className='col-sm-8'>
                        <Button
                            btnAttrs={
                                {
                                    className: 'btn btn-info action-edit-dl',
                                    onClick: (e) => {
                                        this.saveChanges(e);
                                    }
                                }
                            }
                        >
                            {'Guardar'}
                        </Button>
                        <Button
                            btnAttrs={
                                {
                                    className: 'btn btn-default action-button',
                                    onClick: (e) => {
                                        Utils.handleLink(e, `/domains/${this.props.params.domain_id}/distribution_lists/${this.props.params.id}`);
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

        actions = [
            {
                label: 'Guardar',
                props: {
                    className: 'btn btn-info btn-xs action-edit-dl',
                    onClick: (e) => {
                        this.saveChanges(e);
                    }
                }
            },
            {
                label: 'Cancelar',
                props: {
                    className: 'btn btn-default btn-xs action-button',
                    onClick: (e) => {
                        Utils.handleLink(e, `/domains/${this.props.params.domain_id}/distribution_lists/${this.props.params.id}`);
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
                                title={'Editar Lista de Distribución'}
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

EditDistributionList.propTypes = {
    location: PropTypes.object,
    params: PropTypes.any
};
