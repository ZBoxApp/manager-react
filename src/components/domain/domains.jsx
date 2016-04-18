// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import {browserHistory} from 'react-router';

import MessageBar from '../message_bar.jsx';
import PageInfo from '../page_info.jsx';
import Panel from '../panel.jsx';
import StatusLabel from '../status_label.jsx';

import * as Client from '../../utils/client.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';

export default class Domains extends React.Component {
    constructor(props) {
        super(props);

        this.handleLink = this.handleLink.bind(this);
        this.getDomains = this.getDomains.bind(this);

        this.state = {
            data: null
        };
    }
    handleLink(e, path) {
        e.preventDefault();
        if (`/${this.props.location.pathname}` !== path) {
            GlobalActions.emitStartLoading();
            browserHistory.push(path);
        }
    }
    getDomains() {
        Client.getAllDomains(
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
        $('#sidebar-domains').addClass('active');
        this.getDomains();
    }
    componentWillUnmount() {
        $('#sidebar-domains').removeClass('active');
    }

    render() {
        let message;
        if (this.state.error) {
            message = (
                <MessageBar
                    message={this.state.error}
                    type='success'
                    autoclose={true}
                />
            );
        }

        const addDomainButton = [{
            label: 'Agregar Dominio',
            props: {
                className: 'btn btn-success',
                onClick: (e) => {
                    this.handleLink(e, '/domains/new');
                }
            }
        }];

        let tableResults;
        if (this.state.data) {
            tableResults = this.state.data.domain.map((d) => {
                let status;
                let statusClass = 'btn btn-sm ';
                switch (d.attrs.zimbraDomainStatus) {
                case 'active':
                    status = 'Activo';
                    statusClass += 'btn-info';
                    break;
                case 'inactive':
                    status = 'Inactivo';
                    statusClass += 'btn-default';
                    break;
                default:
                    status = 'Migrando';
                    statusClass += 'btn-warning2';
                    break;
                }

                let mailboxes;
                if (d.mailboxes) {
                    const types = d.mailboxes.types.map((t, i) => {
                        return (<li key={`mailbox-${d.id}-${i}`}>{t.count} {t.type}</li>);
                    });

                    mailboxes = (
                        <td className='vertical-middle text-center'>
                            <span className='total-mbxs-per-domain'>d.mailboxes.total</span>
                            <ul className='list-inline'>
                                {types}
                            </ul>
                        </td>
                    );
                } else {
                    mailboxes = (<td className='vertical-middle text-center'/>);
                }

                return (
                    <tr
                        key={d.id}
                        className='domain-row'
                        id={`domain-${d.id}`}
                    >
                        <td className='domain-name'>
                            <h4>
                                <a
                                    href='#'
                                    onClick={(e) => this.handleLink(e, '/domains/' + d.id)}
                                >
                                    {d.name}
                                </a>
                                <br/>
                                <small/>
                            </h4>
                        </td>
                        {mailboxes}
                        <td className='vertical-middle text-justify'>
                            {d.attrs.description}
                        </td>
                        <td className='vertical-middle text-center'>
                            <StatusLabel
                                classes={statusClass}
                                children={status}
                            />
                        </td>
                    </tr>
                );
            });
        }

        const panelBody = (
            <div>
                <div
                    id='index-domains-table'
                    className='table-responsive'
                >
                    <table
                        id='index-domains'
                        cellPadding='1'
                        cellSpacing='1'
                        className='table table-condensed table-striped vertical-align'
                    >
                        <thead>
                        <tr>
                            <th>{'Nombre'}</th>
                            <th className='td-mbxs'>{'Casillas Usadas'}</th>
                            <th className='text-center'>{'Descripción'}</th>
                            <th className='text-center'>{'Estado'}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tableResults}
                        </tbody>
                    </table>

                </div>
            </div>
        );

        const pageInfo = (
            <PageInfo
                titlePage='Dominios'
                descriptionPage='Dominios de correos creados'
            />
        );

        const hasPageInfo = (this.props.children) ? '' : {pageInfo};

        const viewIndex = (
            <Panel
                btnsHeader={addDomainButton}
                children={panelBody}
            />
        );

        const view = (this.props.children || viewIndex);

        return (
            <div>
                {hasPageInfo}
                {message}
                <div className='content animate-panel'>
                    <div className='row'>
                        <div className='col-md-12 central-content'>
                            {view}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Domains.propTypes = {
    location: React.PropTypes.object.isRequired,
    children: React.PropTypes.any
};
