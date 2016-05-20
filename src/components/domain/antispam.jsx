// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import Button from '../button.jsx';
import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';
import Promise from 'bluebird';
import DomainStore from '../../stores/domain_store.jsx';
import EventStore from '../../stores/event_store.jsx';
import Constants from '../../utils/constants.jsx';

const MessageType = Constants.MessageType;

export default class AntiSpam extends React.Component {
    constructor(props) {
        super(props);

        this.handleDelete = this.handleDelete.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.alterDomain = this.alterDomain.bind(this);
        this.domain = DomainStore.getCurrent();
        this.blackList = [];
        this.whiteList = [];

        if (this.domain.attrs.amavisBlacklistSender) {
            this.blackList = Array.isArray(this.domain.attrs.amavisBlacklistSender) ? this.domain.attrs.amavisBlacklistSender : this.domain.attrs.amavisBlacklistSender.trim().split(' ');
        }

        if (this.domain.attrs.amavisWhitelistSender) {
            this.whiteList = Array.isArray(this.domain.attrs.amavisWhitelistSender) ? this.domain.attrs.amavisWhitelistSender : this.domain.attrs.amavisWhitelistSender.trim().split(' ');
        }
    }

    handleDelete(e, item, action) {
        e.preventDefault();
        const attrs = {};

        switch (action) {
        case 'black':
            this.searchItemToRemove(this.blackList, item);
            attrs.amavisBlacklistSender = this.blackList.length > 0 ? this.blackList : null;
            break;
        case 'white':
            this.searchItemToRemove(this.whiteList, item);
            attrs.amavisWhitelistSender = this.whiteList.length > 0 ? this.whiteList : null;
            break;
        }

        this.alterDomain(attrs);
    }

    searchItemToRemove(array, item) {
        const total = array.length;

        for (let i = 0; i < total; i++) {
            if (array[i] === item) {
                array.splice(i, 1);
                break;
            }
        }
    }

    handleSave(e, action) {
        const attrs = {};
        const isEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const isDomain = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
        const target = action === 'black' ? 'lista negra' : 'lista blanca';
        e.preventDefault();

        const input = this.refs[`${action}-item`];
        const value = input.value.trim();

        if (!value || value === '') {
            EventStore.emitMessage({
                message: `No puede agregar una ${target} vacia.`,
                typeError: MessageType.ERROR
            });
            return false;
        }

        const isValid = isEmail.test(value) || isDomain.test(value);

        if (!isValid) {
            EventStore.emitMessage({
                message: `Solo es posible agregar dominios o email en ${target}`,
                typeError: MessageType.ERROR
            });
            return false;
        }

        switch (action) {
        case 'black':
            this.blackList.push(value);
            attrs.amavisBlacklistSender = this.blackList;
            break;
        case 'white':
            this.whiteList.push(value);
            attrs.amavisWhitelistSender = this.whiteList;
            break;
        }

        return this.alterDomain(attrs, e.target, input);
    }

    alterDomain(attrs, button, input) {
        const domain = this.domain;
        const hasButton = button || false;
        const hasInput = input || false;
        let oldContent = null;
        let id = null;

        if (hasButton) {
            oldContent = button.innerHTML;
            id = `#${button.getAttribute('id')}`;
        }

        new Promise((resolve, reject) => {
            if (hasButton) {
                Utils.toggleStatusButtons(id, true);
                button.innerHTML = '<i class=\'fa fa-spinner fa-spin fa-1x fa-fw\'></i> Actualizando';
            }

            Client.modifyDomainByAttrs(domain.id, attrs, (success) => {
                return resolve(success);
            }, (error) => {
                return reject(error);
            });
        }).then((res) => {
            DomainStore.setCurrent(res);
            this.setState({
                update: true
            });
        }).catch((err) => {
            EventStore.emitMessage({
                message: err.message || err.reason,
                typeError: MessageType.ERROR
            });
        }).finally(() => {
            if (hasButton) {
                Utils.toggleStatusButtons(id, false);
                button.innerHTML = oldContent;
            }

            if (hasInput) {
                input.value = '';
            }
        });
    }

    render() {
        let whiteList = null;
        let blackList = null;

        if (this.blackList && this.blackList.length > 0) {
            blackList = this.blackList.map((black, i) => {
                return (
                    <tr
                        key={`black-${i}`}
                    >
                        <td>
                            {black}

                            <Button
                                btnAttrs={
                                    {
                                        className: 'pull-right',
                                        onClick: (e) => {
                                            this.handleDelete(e, black, 'black');
                                        }
                                    }
                                }
                            >
                                <i className='fa fa-minus-circle text-danger'></i>
                            </Button>
                        </td>
                    </tr>
                );
            });
        } else {
            blackList = (
                <tr>
                    <td className='text-center'>
                        <strong>No hay resultados para Lista Negra</strong>
                    </td>
                </tr>
            );
        }

        if (this.whiteList && this.whiteList.length > 0) {
            whiteList = this.whiteList.map((white, i) => {
                return (
                    <tr
                        key={`white-${i}`}
                    >
                        <td>
                            {white}

                            <Button
                                btnAttrs={
                                    {
                                        className: 'pull-right',
                                        onClick: (e) => {
                                            this.handleDelete(e, white, 'white');
                                        }
                                    }
                                }
                            >
                                <i className='fa fa-minus-circle text-danger'></i>
                            </Button>
                        </td>
                    </tr>
                );
            });
        } else {
            whiteList = (
                <tr>
                    <td className='text-center'>
                        <strong>No hay resultados para Lista blanca</strong>
                    </td>
                </tr>
            );
        }

        return (
            <div>
                <div className='row'>
                    <div className='col-xs-6 clearfix'>
                        <div className='row'>
                            <form className='form-inline'>
                                <div className='col-xs-12 text-right'>
                                    <div className='input-group'>
                                        <input
                                            type='text'
                                            className='form-control'
                                            placeholder='Lista blanca'
                                            ref='white-item'
                                        />
                                        <span className='input-group-btn'>
                                            <button
                                                className='btn btn-info'
                                                type='button'
                                                onClick={(e) => {
                                                    this.handleSave(e, 'white');
                                                }}
                                            >
                                                Agregar Lista Blanca
                                            </button>
                                        </span>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className='col-xs-12'>
                            <div className='row'>
                                <table className='table table-striped table-bordered table-hover dataTable no-footer'>
                                    <thead>
                                    <tr>
                                        <th>
                                            {'Nombre'}

                                            <span className='pull-right'>
                                                <i
                                                    className='glyphicon pull-right pointer'
                                                >
                                                </i>
                                            </span>
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                        {whiteList}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className='col-xs-6 clearfix'>
                        <div className='row'>
                            <form className='form-inline'>
                                <div className='col-xs-12 text-right'>
                                    <div className='input-group'>
                                        <input
                                            type='text'
                                            className='form-control'
                                            placeholder='Lista Negra'
                                            ref='black-item'
                                        />
                                        <span className='input-group-btn'>
                                            <button
                                                className='btn btn-info'
                                                type='button'
                                                onClick={(e) => {
                                                    this.handleSave(e, 'black');
                                                }}
                                            >
                                                Agregar Lista Negra
                                            </button>
                                        </span>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className='col-xs-12'>
                            <div className='row'>
                                <table className='table table-striped table-bordered table-hover dataTable no-footer'>
                                    <thead>
                                    <tr>
                                        <th>
                                            {'Nombre'}

                                            <span className='pull-right'>
                                                <i
                                                    className='glyphicon pull-right pointer'
                                                >
                                                </i>
                                            </span>
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                        {blackList}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

AntiSpam.propTypes = {
    data: React.PropTypes.object.isRequired
};
