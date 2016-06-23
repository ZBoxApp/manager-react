// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import MessageBar from '../message_bar.jsx';
import Panel from '../panel.jsx';

import ZimbraStore from '../../stores/zimbra_store.jsx';

import * as Utils from '../../utils/utils.jsx';

export default class CompanyMailboxPlans extends React.Component {
    constructor(props) {
        super(props);
        this.handleBuy = this.handleBuy.bind(this);
    }
    handleBuy(e) {
        e.preventDefault();
        //alert('llevar al usuario a la página que permita comprar más casillas'); //eslint-disable-line no-alert
    }
    render() {
        const company = this.props.company;
        /*const headerButtons = [
            {
                label: 'Comprar',
                props: {
                    className: 'btn btn-info btn-xs',
                    onClick: this.handleBuy
                }
            }
        ];*/
        const headerButtons = [];

        const mailboxPlans = [];
        const cos = Utils.getEnabledPlansByCosId(ZimbraStore.getAllCos());
        const planKeys = Object.keys(cos).map((c) => {
            return cos[c];
        });

        const domains = company.domains || [];

        const plans = {};
        let noLimitError;

        planKeys.forEach((key) => {
            plans[key] = {
                limit: 0,
                used: 0,
                free: 0,
                noLimit: false
            };
        });

        domains.forEach((d) => {
            const domainCos = d.maxAccountsByCos();
            const domainPlans = Utils.getPlansFromDomain(d);
            let used = 0;
            if (domainCos) {
                Object.keys(domainCos).forEach((id) => {
                    const limit = domainCos[id];
                    used = domainPlans[cos[id]].used;
                    plans[cos[id]].limit += limit;
                    plans[cos[id]].used += used;
                    plans[cos[id]].free += (limit - used);
                });
            } else {
                if (!noLimitError) {
                    noLimitError = (
                        <MessageBar
                            message='Existen dominios sin límites asignados'
                            type='WARNING'
                            autoclose={true}
                        />
                    );
                }

                Object.keys(domainPlans).forEach((id) => {
                    if (plans[id]) {
                        used = domainPlans[id].used;
                        plans[id].noLimit = true;
                        plans[id].used += used;
                    }
                });
            }
        });

        for (const key in plans) {
            if (plans.hasOwnProperty(key)) {
                let freeClass = 'text-center';
                let percent = 0;
                let limit = 0;
                let used = 0;
                let free = 0;
                const plan = plans[key];
                limit = plan.limit;
                used = plan.used;
                if (plan.noLimit) {
                    limit = free = '\u221e';
                    percent = 100;
                } else {
                    free = limit - used;
                    percent = Math.round((used * 100) / limit);
                }

                if (percent <= 10) {
                    freeClass += ' alert-free-mbxs';
                } else if (percent <= 20) {
                    freeClass += ' warning-free-mbxs';
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
                            {limit}
                        </td>
                        <td
                            className='text-center'
                            style={{borderTop: 0}}
                        >
                            {used}
                        </td>
                        <td
                            className={freeClass}
                            style={{borderTop: 0}}
                        >
                            {free}
                        </td>
                    </tr>
                );
            }
        }

        const panelBody = (
            <table
                id='company-mbxs'
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
                    <th className='text-center'>{'Libres'}</th>
                </tr>
                </thead>
                <tbody>
                {mailboxPlans}
                </tbody>
            </table>
        );

        return (
            <Panel
                title='Casillas'
                btnsHeader={headerButtons}
                error={noLimitError}
                children={panelBody}
            />
        );
    }
}

CompanyMailboxPlans.propTypes = {
    company: React.PropTypes.object.isRequired
};
