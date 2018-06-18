// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import MessageBar from '../message_bar.jsx';
import Panel from '../panel.jsx';

import ZimbraStore from '../../stores/zimbra_store.jsx';

import * as Utils from '../../utils/utils.jsx';

export default class DomainMailboxPlans extends React.Component {
    constructor(props) {
        super(props);

        this.getMailboxPlans = this.getMailboxPlans.bind(this);

        this.state = {
            plans: null
        };
    }
    componentDidMount() {
        this.getMailboxPlans();
    }
    getMailboxPlans() {
        const plans = this.props.domain.plans;
        if (plans) {
            return this.setState({
                plans
            });
        }
        return this.props.domain.countAccounts(
            (err, data) => {
                if (err) {
                    return this.setState({plans: {}});
                }

                this.props.domain.plans = data;
                return this.setState({plans: data});
            }
        );
    }
    render() {
        const countAccounts = this.state.plans;
        if (!this.state.plans) {
            return <div/>;
        }

        const headerButtons = [
            {
                label: 'Comprar Casillas',
                props: {
                    className: 'btn btn-info btn-xs',
                    onClick: (e) => Utils.handleLink(e, `/sales/${this.props.params.id}/mailboxes`, this.props.location)
                }
            },
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

        const mailboxPlans = [];
        let panelBody = null;
        let noLimitError;
        const isNotMigrating = !countAccounts.migracion;

        if (isNotMigrating) {
            const cos = Utils.getEnabledPlansByCosId(ZimbraStore.getAllCos());
            const planKeys = Object.keys(cos).map((c) => {
                return cos[c];
            });

            const domain = this.props.domain;
            const domainCos = domain.maxAccountsByCos();
            const domainPlans = Utils.getPlansFromDomain(domain);
            const plans = {};
            let totalUsed = 0;
            let totalLimit = 0;

            planKeys.forEach((key) => {
                plans[key] = {
                    limit: 0,
                    used: 0
                };
            });

            let used = 0;
            if (domainCos) {
                Object.keys(domainCos).forEach((id) => {
                    const limit = domainCos[id];
                    used = domainPlans[cos[id]].used;
                    plans[cos[id]].limit += limit;
                    plans[cos[id]].used += used;
                });
            }

            for (const key in plans) {
                if (plans.hasOwnProperty(key) && plans[key].limit !== 0) {
                    const plan = plans[key];
                    totalUsed += (parseInt(plan.used, 10)) ? parseInt(plan.used, 10) : 0;
                    if (plan.limit === 0) {
                        //totalLimit = '\u221e';

                        if (!noLimitError) {
                            noLimitError = (
                                <MessageBar
                                    message='Existen dominios sin límites asignados'
                                    type='WARNING'
                                    autoclose={true}
                                />
                            );
                        }
                    } else {
                        totalLimit += plan.limit;
                    }

                    mailboxPlans.push(
                        <tr key={`plan-${key}`}>
                            <td className='mbx-plan'
                                style={{borderTop: 0}}
                            >
                                {key}
                            </td>
                            <td
                                className='text-center'
                                style={{borderTop: 0}}
                            >
                                {plan.limit || '\u221e'}
                            </td>
                            <td
                                className='text-center'
                                style={{borderTop: 0}}
                            >
                                {plan.used}
                            </td>
                        </tr>
                    );
                }
            }

            if (mailboxPlans.length > 0) {
                mailboxPlans.push(
                    <tr key='totalizacion-planes'>
                        <td className='mbx-plan'
                            style={{borderTop: 0}}
                        >
                            <strong>{'Total'}</strong>
                        </td>
                        <td
                            className='text-center'
                            style={{borderTop: 0}}
                        >
                            <strong>{totalLimit}</strong>
                        </td>
                        <td
                            className='text-center'
                            style={{borderTop: 0}}
                        >
                            <strong>{totalUsed}</strong>
                        </td>
                    </tr>
                );

                panelBody = (
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
                            <th className='text-center'>{'Límite'}</th>
                            <th className='text-center'>{'Usadas'}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {mailboxPlans}
                        </tbody>
                    </table>
                );
            } else {
                panelBody = (
                    <div className='text-center'>
                        <h4 className='text-danger'>{'No se han asignado límites de casillas.'}</h4>
                    </div>
                );
            }
        } else {
            panelBody = (
                <div className='text-center'>
                    <h4 className='text-danger'>{'Se esta realizando una migracion.'}</h4>
                    <blockquote>
                        {`Limite : ${countAccounts.migracion.limit || 'No definido'}`}
                        <br/>
                        {`Usadas : ${countAccounts.migracion.used || 'No definido'}`}
                    </blockquote>
                </div>
            );
        }

        return (
            <Panel
                title='Casillas'
                btnsHeader={headerButtons}
                error={noLimitError}
                children={panelBody}
                classCss={['flex']}
            />
        );
    }
}

DomainMailboxPlans.propTypes = {
    domain: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired
};
