// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import UserStore from '../../stores/user_store.jsx';

import Panel from '../panel.jsx';
import StatusLabel from '../status_label.jsx';

import * as Utils from '../../utils/utils.jsx';

export default class CompanyDomains extends React.Component {
    render() {
        const domains = this.props.company.domains;
        const isAdmin = UserStore.isGlobalAdmin();

        let buttons;
        if (isAdmin) {
            buttons = [{
                label: 'Agregar Dominio',
                props: {
                    className: 'btn btn-default btn-xs',
                    onClick: (e) => Utils.handleLink(e, '/domains/new', this.props.location)
                }
            }];
        }

        let panelBody;
        if (domains.length > 0) {
            const rows = domains.map((d) => {
                let status = d.attrs.zimbraDomainStatus;
                let statusClass = '';
                switch (status) {
                case 'locked':
                    statusClass = 'btn btn-xs btn-warning';
                    status = 'Bloqueado';
                    break;
                case 'closed':
                    statusClass = 'btn btn-xs btn-danger';
                    status = 'Cerrado';
                    break;
                default:
                    statusClass = 'btn btn-xs btn-info';
                    status = 'Activo';
                    break;
                }

                let totalAccounts = 0;
                const plans = Utils.getPlansFromDomain(d);

                const plansArray = Object.keys(plans).map((p) => {
                    const limit = plans[p].limit;
                    totalAccounts += limit;

                    return (
                        <li key={`domain-${d.id}-${p}`}>
                            {limit} {Utils.titleCase(p.slice(0, 3))}
                        </li>
                    );
                });

                return (
                    <tr
                        className='company-domain-row'
                        key={`domain-${d.id}`}
                    >
                        <td className='domain-name'>
                            <h4>
                                <a
                                    href='#'
                                    onClick={(e) => Utils.handleLink(e, `/domains/${d.id}`, this.props.location)}
                                >
                                    {`@${d.name}`}
                                </a>
                            </h4>
                        </td>
                        <td className='company-domain-cell'>
                            <span className='total-mbxs-per-domain'>{totalAccounts}</span>
                            <ul className='list-inline'>
                                {plansArray}
                            </ul>
                        </td>
                        <td className='company-domain-cell'>
                            {d.attrs.description}
                        </td>
                        <td className='company-domain-cell'>
                            <StatusLabel
                                classes={statusClass}
                                children={status}
                            />
                        </td>
                    </tr>
                );
            });
            panelBody = (
                <div className='table-responsive'>
                    <table
                        cellPadding='1'
                        cellSpacing='1'
                        className='table table-condensed table-striped vertical-align'
                    >
                        <thead>
                        <tr>
                            <th>{'Nombre'}</th>
                            <th className='td-mbxs text-center'>{'Casillas'}</th>
                            <th className='text-center'>{'Descripción'}</th>
                            <th className='text-center'>{'Estado'}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows}
                        </tbody>
                    </table>
                </div>
            );
        } else {
            panelBody = (
                <div className='empty-message text-danger'>
                    <h4>
                        {'Esta empresa no tiene dominios registrados.'}
                    </h4>
                </div>
            );
        }

        return (
            <Panel
                btnsHeader={buttons}
                children={panelBody}
            />
        );
    }
}

CompanyDomains.propTypes = {
    company: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired
};
