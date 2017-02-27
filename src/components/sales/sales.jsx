import React from 'react';
import PageInfo from '../page_info.jsx';
import Panel from '../panel.jsx';
import UserStore from '../../stores/user_store.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import * as Utils from '../../utils/utils.jsx';
import * as Client from '../../utils/client.jsx';
import sweetAlert from 'sweetalert';

export default class SalesForm extends React.Component {
    constructor(props) {
        super(props);

        this.buildPurchase = this.buildPurchase.bind(this);
        this.confirmShipping = this.confirmShipping.bind(this);
        this.resetCounter = this.resetCounter.bind(this);

        const {name, attrs} = UserStore.getCurrentUser();
        const {displayName, cn, sn} = attrs._attrs;

        const state = {
            disabled: true,
            purchase: {},
            user: {
                email: name,
                fullname: this.buildFullName(displayName, cn, sn)
            },
            domainId: props.params.domainId
        };

        this.avoidPlans = ['archiving', 'default'];
        this.plans = window.manager_config.plans;
        this.messageCode = window.manager_config.messageCode;

        this.mailboxes = Object.keys(this.plans).filter((plan) => {
            const isValidPlan = !this.avoidPlans.includes(plan);

            if (isValidPlan) {
                state.purchase[plan] = 0;
            }

            return isValidPlan;
        });

        this.state = state;
    }

    resetCounter() {
        const purchase = {};
        const reset = this.mailboxes.forEach((plan) => {
            purchase[plan] = 0;
        });

        this.setState({
            purchase: reset
        });
    }

    componentDidMount() {
        GlobalActions.emitEndLoading();
    }

    onKeyupInput(event, label) {
        const value = event.target.value;

        this.checkAmount(label, value);
    }

    buildFullName(displayName, cn, sn) {
        const fullname = displayName && displayName.trim() !== '' ? displayName : `${cn} ${sn}`;

        return fullname;
    }

    checkAmount(label, _value) {
        const value = _value || 0;
        const state = this.state;
        const purchase = state.purchase;
        const isEnabled = this.mailboxes.some((plan) => {
            const planAmount = plan === label ? value : purchase[plan];
            return planAmount > 0;
        });

        this.setState({
            disabled: !isEnabled,
            purchase: {...purchase, [label]: parseInt(value, 10)}
        });
    }

    onKeydownInput(event) {
        const keycode = event.keyCode || event.which;
        const allows = [8, 9, 37, 39, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105];

        if (allows.includes(keycode)) {
            return true;
        }

        event.preventDefault();
        return null;
    }

    buildPurchase(purchase) {
        const plans = this.plans;
        const content = [];
        this.mailboxes.reduce((last, current) => {
            const quantity = purchase[current];
            if (quantity > 0) {
                const plan = plans[current];
                const label = quantity > 1 ? 'casillas' : 'casilla';
                last.push(`${quantity} ${label} ${plan.label}`);
            }
            return last;
        }, content);
        return content;
    }

    transformToHTML(content) {
        const list = content.join('</strong>, <strong>');
        return `<p><strong>${list}</strong></p>`;
    }

    confirmShipping(e) {
        e.preventDefault();
        const {purchase, user, domainId} = this.state;
        const content = this.transformToHTML(this.buildPurchase(purchase));
        let data = {
            purchase,
            user: user.email,
            fullname: user.fullname
        };
        const options = {
            title: 'Confirmación',
            text: `Esta seguro de realizar la compra de ${content}`,
            html: true,
            confirmButtonText: 'Si, compraré',
            confirmButtonColor: '#4EA5EC',
            showLoaderOnConfirm: true,
            closeOnConfirm: false
        };

        Utils.alertToBuy((isConfirmed) => {
            if (isConfirmed) {
                Client.getDomain(domainId, (domain, err) => {
                    if (err) {
                        return sweetAlert('Error', 'El Dominio no existe.', 'error');
                    }

                    const {name} = domain;
                    data.domain = name;
                    data = JSON.stringify(data);
                    Client.requestMailboxes(data, (response) => {
                        const text = this.messageCode[response.messageCode];
                        this.resetCounter();
                        sweetAlert('Compra éxitosa', text, 'success');
                    }, (error) => {
                        const text = this.messageCode[error.messageCode];
                        sweetAlert('Error', text, 'error');
                    });
                });
            }
        }, options);
    }

    renderInputs() {
        const {purchase} = this.state;
        return this.mailboxes.map((input, index) => {
            const plan = this.plans[input];
            const value = purchase[input];
            return (
                <div
                    key={`sale-input-${plan.label}-${index}`}
                    className='col-xs-4'
                >
                    <div className='form-group'>
                        <div className='input-group'>
                            <div className='input-group-addon'>{`Casilla ${plan.label}`}</div>
                            <input
                                type='text'
                                className='form-control'
                                defaultValue={value}
                                onKeyUp={(event) => this.onKeyupInput(event, input)}
                                onKeyDown={this.onKeydownInput}
                            />
                        </div>
                    </div>
                </div>
            );
        });
    }

    render() {
        const {disabled} = this.state;

        return (
            <div>
                <PageInfo
                    titlePage='Compras'
                    descriptionPage='Comprar casillas'
                />
                <div className='content animate-panel'>
                    <div className='row'>
                        <div className='col-md-12 central-content'>
                            <Panel
                                hasHeader={true}
                                title={'Selecciona la cantidad de casillas que deseas comprar.'}
                            >
                                <form key='form-container'>
                                    <div className='row'>
                                        {this.renderInputs()}
                                    </div>
                                    <div
                                        className='row'
                                    >
                                        <div className='col-xs-12 text-right'>
                                            <button
                                                disabled={disabled}
                                                className='btn btn-info'
                                                onClick={this.confirmShipping}
                                            >Comprar</button>
                                        </div>
                                    </div>
                                </form>
                            </Panel>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

SalesForm.propTypes = {
    params: React.PropTypes.object
};
