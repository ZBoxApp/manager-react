// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';

import MessageBar from '../message_bar.jsx';
import PageInfo from '../page_info.jsx';
import PanelTab from '../panel_tab.jsx';
import Panel from '../panel.jsx';
import StatusLabel from '../status_label.jsx';

import ToggleModalButton from '../toggle_modal_button.jsx';
import AddAdminModal from '../add_admin_modal.jsx';

import DomainStore from '../../stores/domain_store.jsx';

import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';

export default class DomainDetails extends React.Component {
    constructor(props) {
        super(props);

        this.getDomain = this.getDomain.bind(this);
        this.handleDeleteAdmin = this.handleDeleteAdmin.bind(this);

        this.state = {};
    }
    handleDeleteAdmin(e, admin) {
        e.preventDefault();
        console.log(admin); //eslint-disable-line no-console

        //here we need to delete the admin and show a message of success or error
    }
    getDomain() {
        const domain = DomainStore.getCurrent();

        if (domain) {
            GlobalActions.emitEndLoading();
            this.setState({
                domain
            });
        } else {
            Client.getDomain(
                this.props.params.id,
                (data) => {
                    this.setState({
                        domain: data
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
    }
    componentDidMount() {
        $('#sidebar-domains').addClass('active');
        this.getDomain();
    }
    componentWillUnmount() {
        $('#sidebar-domains').removeClass('active');
    }

    render() {
        const domain = this.state.domain;

        if (domain) {
            let message;
            if (this.state.msg) {
                message = (
                    <MessageBar
                        message={this.state.msg}
                        type='success'
                        autoclose={true}
                    />
                );
            }

            const casillasSinPlan = (
                <div
                    id='mbxs-without-cos'
                    className='alert alert-danger'
                    role='alert'
                >
                    <i className='fa fa-exclamation-circle'></i>
                    {'Existen casillas sin Clase de Servicio: 119'}
                </div>
            );

            const editDomainButton = [{
                label: 'Editar',
                props: {
                    className: 'btn btn-default btn-xs',
                    onClick: (e) => Utils.handleLink(e, `/domains/${this.props.params.id}/edit`, this.props.location)
                }
            }];

            const infoBody = (
                <div className='row'>
                    <div className='col-md-12'>
                        <div
                            id={`domain-${domain.id}`}
                            className='domain-info'
                        >
                            <h4>
                                <span className='domain-name'>{`@${domain.name}`}</span>
                                <br/>
                                <small/>
                            </h4>
                            <p>
                                <a
                                    className='account-name'
                                    onClick={(e) => Utils.handleLink(e, `/accounts/${domain.id_empresa}`, this.props.location)}
                                >
                                    {'Nombre de la Empresa'}
                                </a>
                            </p>
                            <ul className='list-unstyled'>
                                <li>
                                    <strong>{'Now! Team: '}</strong>
                                    {domain.attrs.postOfficeBox}
                                </li>
                                <li>
                                    <strong>{'MX Record: '}</strong>
                                    {'your-dns-needs-immediate-attention.dev'}
                                </li>
                                <li>
                                    <strong>{'Próxima renovación: '}</strong>
                                    {'19/10/2016'}
                                </li>
                                <li>
                                </li>
                            </ul>
                            <ul className='list-inline list-unstyled'>
                                <li>
                                    <StatusLabel
                                        classes='btn btn-md btn-info'
                                        children='Anual'
                                    />
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            );

            const casillasBtns = [
                {
                    label: 'Ver casillas',
                    props: {
                        className: 'btn btn-default btn-xs',
                        onClick: (e) => Utils.handleLink(e, `/domains/${this.props.params.id}/mailboxes`, this.props.location)
                    }
                },
                {
                    label: 'Nueva Casilla',
                    props: {
                        className: 'btn btn-info add-button btn-xs',
                        onClick: (e) => Utils.handleLink(e, `/domains/${this.props.params.id}/mailboxes/new`, this.props.location)
                    }
                }
            ];

            const casillasRows = [];
            const casillasArray = [];

            casillasArray.map((c) => {
                return casillasRows.push(
                    <tr>
                        <td className='mbx-plan'
                            style={{borderTop: 0}}
                        >
                            {c.type}
                        </td>
                        <td style={{borderTop: 0}}>{c.limit}</td>
                        <td style={{borderTop: 0}}>{c.used}</td>
                    </tr>
                );
            });

            const casillasBody = (
                <table
                    id='domain-mbxs'
                    cellPadding='1'
                    cellSpacing='1'
                    className='table'
                    style={{marginBottom: '0px'}}
                >
                    <thead>
                    <tr>
                        <th style={{width: '50%'}}></th>
                        <th>Límite</th>
                        <th>Usadas</th>
                    </tr>
                    </thead>
                    <tbody>
                    {casillasRows}
                    </tbody>
                </table>
            );

            const admins = []; // this should be the actual admins
            const adminRows = admins.map((a) => {
                return (
                    <tr
                        key={`admin-${a.id}`}
                        className='user-row'
                    >
                        <td className='user-email'>
                            {a.email}
                        </td>
                        <td className='user-name text-center'>
                            {a.username}
                        </td>
                        <td className='user-type text-center'>
                            {a.type}
                        </td>
                        <td className='user-actions text-center'>
                            <ul className='list-inline list-unstyled'>
                                <li>
                                    <a
                                        className='btn btn-default btn-xs'
                                        onClick={(e) => Utils.handleLink(e, `/mailboxes/${a.id}/edit`, this.props.location)}
                                    >
                                        {'Editar'}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className='btn btn-danger btn-xs'
                                        onClick={(e) => this.handleDeleteAdmin(e, a)}
                                    >
                                        {'Eliminar'}
                                    </a>
                                </li>
                            </ul>
                        </td>
                    </tr>
                );
            });

            let adminContent;
            if (adminRows.length > 0) {
                adminContent = (
                    <div className='table-responsive'>
                        <table
                            id='index-users'
                            cellPadding='1'
                            cellSpacing='1'
                            className='table table-condensed table-striped vertical-align'
                        >
                            <thead>
                            <tr>
                                <th>{'email'}</th>
                                <th className='text-center'>{'Nombre'}</th>
                                <th></th>
                                <th className='text-center'>{'Acciones'}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {adminRows}
                            </tbody>
                        </table>
                        <ToggleModalButton
                            role='button'
                            className='btn btn-default'
                            dialogType={AddAdminModal}
                            dialogProps={{domain}}
                        >
                            {'Agregar administrador'}
                        </ToggleModalButton>
                    </div>
                );
            } else {
                adminContent = (
                    <div className='empty-message'>
                        <h4>
                            {'No existen Administradores. '}
                            <ToggleModalButton
                                role='button'
                                dialogType={AddAdminModal}
                                dialogProps={{domain}}
                            >
                                {'Agregar administrador'}
                            </ToggleModalButton>
                        </h4>
                    </div>
                );
            }

            const tabAdmin = (
                <Panel
                    hasHeader={false}
                    children={adminContent}
                />
            );

            const tab2 = (
                <Panel
                    title='Casillas'
                    btnsHeader={casillasBtns}
                    children={casillasBody}
                />
            );

            const panelTabs = (
                <PanelTab
                    tabNames={['Administradores', 'Listas De Distribución']}
                    tabs={{
                        administradores: tabAdmin,
                        listas_de_distribución: tab2
                    }}
                />
            );

            return (
                <div>
                    <PageInfo
                        titlePage='Dominios'
                        descriptionPage='Dominios de correos creados'
                    />
                    {message}
                    <div className='content animate-panel'>
                        {casillasSinPlan}
                        <div className='row'>
                            <div className='col-md-6 central-content'>
                                <Panel
                                    title='Información General'
                                    btnsHeader={editDomainButton}
                                    children={infoBody}
                                />
                            </div>
                            <div className='col-md-6 central-content'>
                                <Panel
                                    title='Casillas'
                                    btnsHeader={casillasBtns}
                                    children={casillasBody}
                                />
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-md-12 panel-with-tabs'>
                                {panelTabs}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return <div/>;
    }
}

DomainDetails.propTypes = {
    location: React.PropTypes.object.isRequired,
    params: React.PropTypes.object.isRequired
};
