import React from 'react';
import PageInfo from '../page_info.jsx';
import Panel from '../panel.jsx';
import moment from 'moment';
import currencyFormatter from 'currency-formatter';
import EventStore from '../../stores/event_store.jsx';
import UserStore from '../../stores/user_store.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import * as Utils from '../../utils/utils.jsx';
import * as Client from '../../utils/client.jsx';

import ZimbraStore from '../../stores/zimbra_store.jsx';

export default class SalesForm extends React.Component {
    constructor(props) {
        super(props);

        this.handleSetNumbersOfMailboxes = this.handleSetNumbersOfMailboxes.bind(this);
        this.getPrices = this.getPrices.bind(this);
        this.onlyNumber = this.onlyNumber.bind(this);
        this.confirmShipping = this.confirmShipping.bind(this);
        this.getDomainInfo = this.getDomainInfo.bind(this);
        this.tryAgain = this.tryAgain.bind(this);

        this.cos = Utils.getEnabledPlansByCos(ZimbraStore.getAllCos());
        this.plans = window.manager_config.plans;
        this.keys = Object.keys(this.cos);
        this.sales = {};
        this.isNAN = false;
        this.currency = window.manager_config.invoiceAPI.currency;
        const precision = this.currency === 'CLP' ? 0 : 2;
        this.currencyParams = {code: this.currency, symbol: '', precision};

        this.state = {
            loading: true,
            errorAjax: false
        };
    }

    confirmShipping(e) {
        e.preventDefault();
        const plans = [];
        const {domain} = this.state;
        const domainId = domain.id;
        const companyId = domain.attrs.businessCategory;
        const adminEmail = UserStore.getCurrentUser().name;
        const items = {};
        const data = {
            domainId,
            companyId,
            adminEmail,
            upgrade: false,
            currency: this.currency
        };

        this.keys.forEach((plan) => {
            if (this.sales[plan] && this.sales[plan].quantity && this.sales[plan].quantity > 0) {
                items[plan] = this.sales[plan];
                items[plan].type = 'Producto';
                plans.push(`${Utils.titleCase(plan)} : <strong>${this.sales[plan].quantity}</strong>`);
            }
        });

        if (plans.length < 1) {
            return EventStore.emitToast({
                type: 'error',
                title: 'Compra Casillas',
                body: 'Debe indicar cuantas casillas desea comprar.',
                options: {
                    timeOut: 4000,
                    extendedTimeOut: 2000,
                    closeButton: true
                }
            });
        }

        const content = plans.join(', ');
        const total = `${this.refs.total.value} ${this.currency}`;
        const options = {
            title: 'Confirmación',
            text: `Esta seguro de realizar la compra de ${content} por un total de <strong>${total}</strong>`,
            html: true,
            confirmButtonText: 'Si, compraré',
            confirmButtonColor: '#4EA5EC',
            showLoaderOnConfirm: true,
            closeOnConfirm: false
        };

        Utils.alertToBuy((isConfirmed) => {
            if (isConfirmed) {
                data.items = items;
                const requestObject = JSON.stringify(data);
                Client.makeSale(requestObject, () => {
                    Utils.alertToBuy((isConfirmed) => {
                        if (isConfirmed) {
                            Utils.handleLink(null, `/domains/${domainId}/mailboxes/new`);
                        }
                    }, {
                        title: 'Compra de Casillas',
                        text: 'Su compra se ha realizado con éxito.',
                        showCancelButton: false,
                        confirmButtonColor: '#4EA5EC',
                        confirmButtonText: 'Muy bien',
                        type: 'success'
                    });
                }, (error) => {
                    Utils.alertToBuy(() => {
                        return null;
                    }, {
                        title: 'Error',
                        text: error.message || error.error.message || 'Ha ocurrido un error desconocido.',
                        showCancelButton: false,
                        confirmButtonColor: '#4EA5EC',
                        confirmButtonText: 'Entiendo',
                        type: 'error',
                        closeOnConfirm: true
                    });
                });
            }
        }, options);
    }

    getPrices() {
        const {domainId} = this.props.params || this.state.domain.name || null;
        const attrs = this.state.domain.attrs;
        const {zimbraCreateTimestamp} = attrs;
        const {businessCategory} = attrs;

        const data = {
            domainId,
            domainCreatedDate: moment(zimbraCreateTimestamp).format('MM/DD/Y'),
            anualRenovation: true,
            companyId: businessCategory,
            type: 'standar',
            currency: this.currency
        };

        Client.getPrices(data, (success) => {
            this.setState({
                loading: false,
                prices: success.result.prices,
                isAnual: success.result.isAnual,
                description: success.result.isAnual ? success.result.description : null
            });
        }, (error) => {
            this.setState({
                errorAjax: true,
                loading: false
            });

            return EventStore.emitToast({
                type: 'error',
                title: 'Compras - Precios',
                body: error.message || error.error.message || 'Ha ocurrido un error al intentar obtener los precios, vuelva a intentarlo por favor.',
                options: {
                    timeOut: 4000,
                    extendedTimeOut: 2000,
                    closeButton: true
                }
            });
        });
    }

    tryAgain(e) {
        e.preventDefault();

        this.setState({
            loading: true,
            errorAjax: false
        });

        this.getPrices();
    }

    getDomainInfo() {
        const {domainId} = this.props.params;

        Client.getDomain(domainId, (res, err) => {
            if (err) {
                return Utils.alertToBuy(() => {
                    return null;
                }, {
                    title: 'Error',
                    text: err.message || err.error.message || 'Ha ocurrido un error desconocido, cuando se recuperaba la información del dominio.',
                    showCancelButton: false,
                    confirmButtonColor: '#4EA5EC',
                    confirmButtonText: 'Entiendo',
                    type: 'error',
                    closeOnConfirm: true
                });
            }

            this.setState({
                domain: res
            });

            return this.getPrices();
        });
    }

    componentDidMount() {
        GlobalActions.emitEndLoading();
        this.getDomainInfo();
    }

    handleSetNumbersOfMailboxes(e, id) {
        if (this.isNAN) {
            e.preventDefault();
            return null;
        }

        const amount = e.target.value.trim();
        let totalPrice = 0;
        let description = 'Nuevas Casillas ';

        this.keys.forEach((plan) => {
            if (this.cos[plan] === id) {
                const price = this.state.prices[plan];
                const size = amount.length > 0 ? parseInt(amount, 10) : 0;
                const total = size ? size * price : size;
                const totalFormatted = total ? currencyFormatter.format(total, this.currencyParams) : total;
                this.refs[`${plan}-total`].value = totalFormatted;
                description += Utils.titleCase(plan);

                this.sales[plan] = {
                    quantity: size,
                    description,
                    price,
                    id,
                    total
                };
            }
            if (this.sales[plan] && this.sales[plan].total && this.sales[plan].total > 0) {
                totalPrice += this.sales[plan].total;
            }
        });

        const currentTotal = totalPrice ? currencyFormatter.format(totalPrice, this.currencyParams) : totalPrice;
        this.refs.total.value = currentTotal;
    }

    onlyNumber(e) {
        const key = e.keyCode;
        const forbidden = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 8, 9, 37, 39];
        this.isNAN = false;

        if (!(forbidden.indexOf(key) > -1)) {
            this.isNAN = true;
            e.preventDefault();
            return null;
        }
    }

    render() {
        const plans = this.cos;
        const configPlans = this.plans;
        const keysPlans = this.keys;
        let form = null;
        let actions;
        const buttons = [];
        const {description} = this.state;
        let descriptionText;

        if (description) {
            descriptionText = (
                <div
                    key='desc-key'
                    className='alert alert-info margin-bottom'
                >
                    <span
                        className='glyphicon glyphicon glyphicon-question-sign'
                        aria-hidden='true'
                    ></span>
                    <span className='sr-only'>Info:</span>
                    {description}
                </div>
            );
        }

        if (this.state.errorAjax) {
            form = (
                <div
                    className='text-center'
                    key={'errorajax-loading'}
                >
                    <i
                        className='fa fa-refresh fa-4x fa-fw pointer'
                        onClick={this.tryAgain}
                    >
                    </i>
                    <p>{'Intentarlo de nuevo'}</p>
                </div>
            );
        }

        if (this.state.isAnual) {
            buttons.push(
                {
                    label: 'Anual',
                    props: {
                        className: 'btn btn-success btn-xs'
                    }
                }
            );
        } else {
            buttons.push(
                {
                    label: 'Mensual',
                    props: {
                        className: 'btn btn-info btn-xs'
                    }
                }
            );
        }

        if (this.state.loading) {
            form = (
                <div
                    className='text-center'
                    key={'prices-loading'}
                >
                    <i className='fa fa-spinner fa-spin fa-4x fa-fw'></i>
                    <p>{'Cargando Precios...'}</p>
                </div>
            );
        }

        if (!this.state.loading && this.state.prices) {
            const prices = this.state.prices;
            const rows = keysPlans.map((plan) => {
                const cosId = plans[plan];
                const salesArray = configPlans[plan].sales;
                const fields = salesArray.map((field, index) => {
                    const label = field.label || `Casillas ${Utils.titleCase(plan)}`;
                    const price = field.hasPrice ? currencyFormatter.format(prices[plan], this.currencyParams) : '';
                    const myref = field.ref ? {ref: `${plan}-${field.ref}`} : {};
                    return (
                        <div
                            key={`sale-input-${plan}-${index}`}
                            className='col-xs-4'
                        >
                            <div className='form-group'>
                                <div className='input-group'>
                                    <div className='input-group-addon'>{label}</div>
                                    <input
                                        type='text'
                                        className='form-control'
                                        disabled={field.disabled}
                                        defaultValue={price}
                                        {...myref}
                                        onKeyUp={(e) => {
                                            this.handleSetNumbersOfMailboxes(e, cosId);
                                        }}
                                        onKeyDown={this.onlyNumber}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                });

                return (
                    <div
                        key={`row-fields-${plan}`}
                        className='row'
                    >
                        {fields}
                    </div>
                );
            });

            form = (
                <form key='form-container'>
                    {rows}
                    <div className='row'>
                        <div className='col-xs-4 pull-right'>
                            <div className='form-group'>
                                <div className='input-group'>
                                    <div className='input-group-addon'>Total</div>
                                    <input
                                        type='text'
                                        disabled={true}
                                        className='form-control'
                                        ref='total'
                                    />
                                    <div className='input-group-addon'>{this.currency}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            );

            actions = (
                <div
                    className='row'
                    key='actions-container'
                >
                    <div className='col-xs-12 text-right'>
                        <button className='btn btn-default'>Cancelar</button>
                        <button
                            className='btn btn-info'
                            onClick={this.confirmShipping}
                        >Comprar</button>
                    </div>
                </div>
            );
        }

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
                                btnsHeader={buttons}
                                children={[descriptionText, form, actions]}
                            />
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
