// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import moment from 'moment';
import _ from 'lodash';

import MessageBar from '../message_bar.jsx';
import Panel from '../panel.jsx';
import StatusLabel from '../status_label.jsx';

import * as Client from '../../utils/client.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import Constants from '../../utils/constants.jsx';

const messageType = Constants.MessageType;

export default class CompanyInvoices extends React.Component {
    constructor(props) {
        super(props);

        this.getInvoices = this.getInvoices.bind(this);

        this.state = {};
    }
    componentDidMount() {
        this.getInvoices();
    }
    getInvoices() {
        if (global.window.manager_config.companiesEndPoints.invoices) {
            return Client.getInvoices(
                this.props.company.id,
                (invoices) => {
                    const hasDebt = _.find(invoices, {status: 2});
                    if (hasDebt) {
                        GlobalActions.showAlert({
                            type: 'error',
                            title: 'Cuenta con deuda',
                            body: 'Tiene una o más facturas impagas. Por favor corrija esta situación para prevenir un bloqueo de los servicios',
                            options: {
                                timeOut: 10000,
                                extendedTimeOut: 5000,
                                closeButton: true
                            }
                        });
                    }
                    this.setState({invoices});
                },
                (error) => {
                    this.setState({
                        error: {
                            message: error.message,
                            type: messageType.ERROR
                        }
                    });
                }
            );
        }

        return this.setState({
            error: {
                message: 'No se ha configurado la integración con el sistema de facturación.',
                type: messageType.WARNING
            }
        });
    }
    render() {
        const invoices = this.state.invoices;
        const error = this.state.error;

        let errorMessage;
        if (error) {
            errorMessage = (
                <MessageBar
                    message={error.message}
                    type={error.type || messageType.ERROR}
                    canClose={false}
                />
            );
        }

        let panelBody;
        if (invoices) {
            if (invoices.length > 0) {
                const rows = invoices.map((i) => {
                    let status;
                    let statusClass = '';
                    let number = i.number;
                    if (i.link) {
                        number = (
                            <a
                                href={i.link}
                                target='_blank'
                            >
                                {i.number}
                            </a>
                        );
                    }

                    switch (i.status) {
                    case 0:
                        status = 'Pendiente';
                        statusClass = 'btn btn-xs btn-info';
                        break;
                    case 1:
                        status = 'Pagada';
                        statusClass = 'btn btn-xs btn-success';
                        break;
                    case 2:
                        status = 'Vencida';
                        statusClass = 'btn btn-xs btn-danger';
                        break;
                    default:
                        status = 'Anulada';
                        statusClass = 'btn btn-xs btn-default';
                        break;
                    }

                    return (
                        <tr key={`invoice-${i.number}`}>
                            <td>
                                {number}
                            </td>
                            <td className='text-center'>
                                {i.total}
                            </td>
                            <td className='text-center'>
                                {moment(i.date).locale('es').format('DD [de] MMMM [de] YYYY')}
                            </td>
                            <td className='text-center'>
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
                                <th>{'Número'}</th>
                                <th className='text-center'>{'Total'}</th>
                                <th className='text-center'>{'Fecha'}</th>
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
                errorMessage = (
                    <MessageBar
                        message='Esta empresa todavía no tiene facturas emitidas.'
                        type={messageType.INFO}
                        canClose={false}
                    />
                );
            }
        }

        if (error || invoices) {
            return (
                <Panel
                    title='Facturas'
                    error={errorMessage}
                    children={panelBody}
                />
            );
        }

        return <div/>;
    }
}

CompanyInvoices.propTypes = {
    company: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired
};
