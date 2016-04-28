// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import _ from 'lodash';

import Panel from '../panel.jsx';
import StatusLabel from '../status_label.jsx';

import * as Utils from '../../utils/utils.jsx';

export default class CompanyAdmins extends React.Component {
    constructor(props) {
        super(props);

        this.getCompanyAdmins = this.getCompanyAdmins.bind(this);

        this.state = this.getCompanyAdmins();
    }
    getCompanyAdmins() {
        const domains = this.props.company.domains;
        const admins = [];

        if (domains) {
            domains.forEach((d) => {
                if (d.admins) {
                    Reflect.apply(Array.prototype.push, admins, d.admins);
                }
            });
        }

        return {
            admins: _.uniqBy(admins, 'id')
        };
    }
    render() {
        const admins = this.state.admins;

        let panelBody;
        if (admins.length > 0) {
            const rows = admins.map((a) => {
                let globalAdmin = a.attrs.zimbraIsAdminAccount === 'TRUE';
                let adminClass = '';
                if (globalAdmin) {
                    adminClass = 'btn btn-xs btn-danger';
                    globalAdmin = 'global admin';
                } else {
                    adminClass = 'btn btn-xs btn-info';
                    globalAdmin = 'domain admin';
                }

                return (
                    <tr
                        key={`admin-${a.id}`}
                        className='user-row'
                    >
                        <td className='user-email'>
                            {a.name}
                        </td>
                        <td className='user-name text-center'>
                            {a.attrs.cn} {a.attrs.sn}
                        </td>
                        <td className='user-type text-center'>
                            <StatusLabel
                                classes={adminClass}
                                children={globalAdmin}
                            />
                        </td>
                        <td className='user-actions text-center'>
                            <a
                                className='btn btn-default btn-xs'
                                href='#'
                                onClick={(e) => Utils.handleLink(e, `/mailboxes/${a.id}/edit`, this.props.location)}
                            >
                                {'Editar'}
                            </a>
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
                            <th>{'email'}</th>
                            <th className='td-mbxs text-center'>{'Nombre'}</th>
                            <th className='text-center'>{'Perfil'}</th>
                            <th className='text-center'>{'Acciones'}</th>
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
                        {'Esta empresa no tiene administradores de dominio registrados.'}
                    </h4>
                </div>
            );
        }

        return (
            <Panel
                hasHeader={false}
                children={panelBody}
            />
        );
    }
}

CompanyAdmins.propTypes = {
    company: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired
};
