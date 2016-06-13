// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import DomainStore from '../../stores/domain_store.jsx';

import * as GlobalActions from '../../action_creators/global_actions.jsx';
import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';

import {Modal} from 'react-bootstrap';

import React from 'react';

export default class AddDistributionListModal extends React.Component {
    constructor(props) {
        super(props);

        this.isStoreEnabled = window.manager_config.enableStores;
        this.handleAddList = this.handleAddList.bind(this);
        this.state = {};
    }

    handleAddList(e) {
        e.preventDefault();
        GlobalActions.emitStartLoading();
        Utils.validateInputRequired(this.refs).then(
            () => {
                const email = `${this.refs.dl_address.value.trim()}@${this.props.domain.name}`;
                const displayName = this.refs.dl_name.value.trim();

                Client.addDistributionList(
                    email,
                    {displayName},
                    (data) => {
                        if (this.isStoreEnabled) {
                            DomainStore.addDistributionList(data);
                        } else {
                            DomainStore.emitDistributionListsChange('add');
                        }
                        GlobalActions.emitEndLoading();
                        this.props.onHide();
                    },
                    (error) => {
                        GlobalActions.emitEndLoading();
                        this.setState({
                            error
                        });
                    }
                );
            },
            (error) => {
                GlobalActions.emitEndLoading();
                this.setState({error});
            }
        );
    }
    componentWillReceiveProps(nextProps) {
        if (!this.props.show && nextProps.show) {
            this.setState({error: null});
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (!this.props.show && !nextProps.show) {
            return false;
        }

        if (!Utils.areObjectsEqual(this.props, nextProps)) {
            return true;
        }

        return !Utils.areObjectsEqual(this.state, nextState);
    }

    render() {
        let addressClass = 'form-group string required clearfix';
        let errorLabel;
        if (this.state.error) {
            addressClass += ' has-error';
            errorLabel = (
                <div className='row'>
                    <div className='col-xs-12 text-center'>
                        <label className='text-danger'>{this.state.error.message}</label>
                    </div>
                </div>
            );
        }

        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onHide}
            >
                <div className='color-line'></div>
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        {'Agregar lista de distribución'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className={addressClass}>
                        <label
                            className='string required col-sm-3'
                            htmlFor='dl_address'
                        >
                            <abbr title='requerido'>{'*'}</abbr>
                            {' Dirección'}
                        </label>
                        <div className='col-sm-9'>
                            <div className='input-group col-sm-12'>
                                <input
                                    className='string required form-control'
                                    data-required='true'
                                    placeholder='dirección email'
                                    type='text'
                                    name='dl_address'
                                    id='dl_address'
                                    ref='dl_address'
                                    data-message='Debes asignar una dirección para la lista de distribución'
                                />
                                    <span className='input-group-addon'>
                                        {`@${this.props.domain.name}`}
                                    </span>
                            </div>
                        </div>
                    </div>
                    <div className='form-group string optional clearfix'>
                        <label
                            className='string optional col-sm-3'
                            htmlFor='dl_name'
                        >
                            {'Nombre'}
                        </label>
                        <div className='col-sm-9'>
                            <input
                                className='string optional string optional form-control'
                                placeholder='nombre mostrado en contactos'
                                type='text'
                                name='dl_name'
                                id='dl_name'
                                ref='dl_name'
                            />
                        </div>
                    </div>
                    {errorLabel}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-default'
                        onClick={this.props.onHide}
                    >
                        {'Cancelar'}
                    </button>
                    <button
                        type='button'
                        className='btn btn-primary'
                        onClick={this.handleAddList}
                    >
                        {'Guardar'}
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}

AddDistributionListModal.propTypes = {
    show: React.PropTypes.bool.isRequired,
    onHide: React.PropTypes.func.isRequired,
    domain: React.PropTypes.object.isRequired
};
