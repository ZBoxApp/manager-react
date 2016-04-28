// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import Panel from '../panel.jsx';

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

                return this.setState({plans: data});
            }
        );
    }
    render() {
        if (!this.state.plans) {
            return <div/>;
        }

        const headerButtons = [
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
        const plans = this.state.plans;
        const configPlans = global.window.manager_config.plans;
        let totalUsed = 0;
        let totalLimit = 0;
        for (const key in plans) {
            if (plans.hasOwnProperty(key) && configPlans[key]) {
                const plan = plans[key];
                totalUsed += plan.used;
                totalLimit += plan.limit || 0;
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
                    <strong>{totalLimit || '\u221e'}</strong>
                </td>
                <td
                    className='text-center'
                    style={{borderTop: 0}}
                >
                    <strong>{totalUsed}</strong>
                </td>
            </tr>
        );

        const panelBody = (
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

        return (
            <Panel
                title='Casillas'
                btnsHeader={headerButtons}
                children={panelBody}
            />
        );
    }
}

DomainMailboxPlans.propTypes = {
    domain: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
    params: React.PropTypes.object.isRequired
};
