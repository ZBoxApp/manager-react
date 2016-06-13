// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import * as GlobalActions from '../action_creators/global_actions.jsx';
import SelectCols from './select-col.jsx';
import ZimbraStore from '../stores/zimbra_store.jsx';
import * as Utils from '../utils/utils.jsx';
import * as Client from '../utils/client.jsx';
import MailboxStore from '../stores/mailbox_store.jsx';

export default class ImportMassiveModal extends React.Component {
    constructor(props) {
        super(props);

        this.buildCols = this.buildCols.bind(this);
        this.options = {
            email: 'email',
            contraseña: 'passwd',
            plan: 'zimbraCOSId',
            nombres: 'givenName',
            apellidos: 'sn'
        };

        this.mandatory = {
            email: true,
            passwd: true,
            zimbraCOSId: true,
            total: 3
        };

        this.uploaded = null;
        this.disabled = {};

        this.plans = Utils.getEnabledPlansByCos(ZimbraStore.getAllCos());

        this.limit = 200;

        this.state = {
            options: this.options
        };
    }

    onFileUploaded(e) {
        e.preventDefault();

        const file = e.target.files[0];
        const isCSV = !(file.type === 'text/csv');
        this.refs.console.value = this.refs.realfile.value;

        if (isCSV) {
            this.setState({
                alert: true,
                alertMessage: 'Solo se permite archivos de tipo CSV, verifique por favor',
                cols: null
            });
            return false;
        }

        if (file) {
            const fileReader = new FileReader();

            fileReader.onload = (res) => {
                const result = res.target.result;

                if (result) {
                    const cols = this.extractCols(result, 'email');

                    if (cols.hasError) {
                        this.setState({
                            alert: true,
                            alertMessage: cols.message,
                            cols: null
                        });

                        return false;
                    }

                    const columns = cols.cols;
                    this.uploaded = columns;

                    this.setState({
                        cols: columns,
                        alert: null
                    });

                    Utils.toggleStatusButtons('.action-massive', false);
                } else {
                    return this.setState({
                        alert: true,
                        alertMessage: 'Su archvio esta vacio, verifiquelo, por favor'
                    });
                }

                return null;
            };

            fileReader.readAsText(file);
        }

        return null;
    }

    onChangeColumn(e, option, key) {
        const parent = e.target.parentNode;

        if (option.restart) {
            parent.classList.remove('ok-option');
            parent.classList.add('missing-option');
            Reflect.deleteProperty(this.disabled, option.restart);
        }

        if (option && !option.restart) {
            parent.classList.remove('missing-option');
            parent.classList.add('ok-option');
            this.disabled[option] = {
                col: key
            };
        }

        this.setState({
            change: true
        });
    }

    buildCols(cols) {
        const columns = Object.keys(cols).reverse().sort((a, b) => {
            return a - b;
        });

        const obj = {};

        columns.forEach((key) => {
            if (cols.hasOwnProperty(key)) {
                obj[key] = cols[key];
            }
        });

        return {
            columns,
            obj
        };
    }

    extractCols(data, flagDefault) {
        let splitConditio = /\r\n|\r|\n/g;
        let hasError = false;
        const dataArray = data.split(splitConditio);

        const isEmpty = dataArray.some((pos) => {
            if (pos === '') {
                return true;
            }

            return null;
        });

        if (isEmpty) {
            hasError = true;
            return {
                hasError,
                message: 'Su archivo no es correcto, verifiquelo por favor.'
            };
        }

        const limit = dataArray.length;
        const isEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const error = [];
        let message = null;

        if (limit < 1) {
            hasError = true;
            message = 'Su archivo esta vacio, verifiquelo por favor';
            return {
                hasError,
                error,
                message
            };
        }

        const array = [];

        for (let k = 0; k < limit; k++) {
            let row = dataArray[k];
            row = row.replace(/\'|\"/g, '');
            row = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

            array.push(row);
        }

        const ul = {};
        const total = array.length;
        let lastRow = null;

        for (let r = 0; r < total; r++) {
            const totalCols = array[r].length;
            if (lastRow) {
                if (lastRow !== totalCols) {
                    hasError = true;
                    message = 'Su archivo presenta un error, verifique por favor.';
                    break;
                }
            }
            lastRow = totalCols;

            for (let c = 0; c < totalCols; c++) {
                const col = array[r][c];
                if (!ul[c]) {
                    if (col.indexOf('@') > -1) {
                        if (isEmail.test(col)) {
                            ul[c] = {};
                            ul[c][flagDefault] = [];
                            this.disabled[flagDefault] = {
                                col: c
                            };
                        } else {
                            error.push(col);
                            hasError = true;
                        }
                    } else {
                        ul[c] = [];
                    }
                }

                if (ul[c][flagDefault]) {
                    ul[c][flagDefault].push(col);
                } else {
                    ul[c].push(col);
                }
            }
        }

        return {
            hasError,
            error,
            message,
            cols: ul
        };
    }

    onSubmit() {
        const padre = {};
        let counter = 0;

        for (const key in this.disabled) {
            if (this.disabled.hasOwnProperty(key) && (this.disabled[key].col in this.uploaded)) {
                const current = this.disabled[key].col;

                if (this.mandatory[this.options[key]]) {
                    counter++;
                }

                const length = (Array.isArray(this.uploaded[current])) ? this.uploaded[current].length : this.uploaded[current].email.length;
                const data = (Array.isArray(this.uploaded[current])) ? this.uploaded[current] : this.uploaded[current].email;

                for (var i = 0; i < length; i++) {
                    if (!padre[i]) {
                        padre[i] = {};
                    }

                    padre[i][this.options[key]] = data[i];
                }
            }
        }

        if (counter === this.mandatory.total) {
            this.setState({
                alert: false
            });

            return this.createMassiveAccounts(padre);
        }

        this.setState({
            alert: true,
            alertMessage: 'Faltan columnas que son obligatorias, verifique por favor.'
        });
        return null;
    }

    createMassiveAccounts(accounts) {
        const allAccounts = [];
        let hasError = false;
        let runAgain = false;
        let loop = 0;

        for (const account in accounts) {
            if (accounts.hasOwnProperty(account)) {
                accounts[account].zimbraCOSId = this.plans[accounts[account].zimbraCOSId.toLowerCase()];
                const email = accounts[account].email;
                const passwd = accounts[account].passwd;
                if (passwd.length < 8) {
                    hasError = true;
                    break;
                }
                Reflect.deleteProperty(accounts[account], 'email');
                Reflect.deleteProperty(accounts[account], 'passwd');

                allAccounts.push(Client.createAccountByBatch(email, passwd, accounts[account]));
                Reflect.deleteProperty(accounts, account);
                loop++;

                if (loop >= this.limit) {
                    const step = parseInt(account, 10);
                    if (accounts[step + 1]) {
                        runAgain = true;
                        loop = 0;
                    }
                    break;
                }
            }
        }

        if (hasError) {
            return this.setState({
                alert: true,
                alertMessage: 'La contraseña debe ser mayor a 8 caracteres, verifique su archivo por favor.'
            });
        }

        GlobalActions.emitStartTask({
            origin: 'Casillas',
            action: 'Importando casillas masivamente.',
            id: 'casillamasiva'
        });

        Client.batchRequest(allAccounts, (response) => {
            if (response.CreateAccountResponse) {
                if (Array.isArray(response.CreateAccountResponse)) {
                    const length = response.CreateAccountResponse.length;

                    for (let i = 0; i < length; i++) {
                        const account = response.CreateAccountResponse[i].account[0];
                        const accountFormatted = Client.buildAccountByObject(account);
                        MailboxStore.setMailbox(accountFormatted);
                    }

                    MailboxStore.emitAddMassive();
                }
            }

            if (runAgain) {
                setTimeout(() => {
                    this.createMassiveAccounts(accounts);
                }, 250);
                return null;
            }

            //Aqui va error batchrequest

            if (this.show) {
                this.onHide();
            }

            return GlobalActions.emitEndTask({
                id: 'casillamasiva',
                toast: {
                    message: 'Se han importado todas las casillas.',
                    title: 'Mailbox - Carga Masiva'
                }
            });
        });

        return null;
    }

    render() {
        let ul = null;
        let labelError = null;

        if (this.state.alert) {
            labelError = (
                <label className='text-danger'>{this.state.alertMessage}</label>
            );
        }

        if (this.state.cols) {
            const columns = this.state.cols;
            ul = [];

            for (const col in columns) {
                if (columns.hasOwnProperty(col)) {
                    const key = (Array.isArray(columns[col])) ? col : 'email';
                    const element = (Array.isArray(columns[col])) ? columns[col] : columns[col].email;
                    const selected = (Array.isArray(columns[col])) ? false : 'email';
                    const current = (selected) ? 'ok-option' : 'missing-option';

                    ul.push(
                        <div
                            className='col-import'
                            key={`wrap-col-${col}`}
                        >
                            <div className={`wrap-border-col ${current}`}>

                                <SelectCols
                                    options={this.state.options}
                                    selectAttrs={{
                                        className: 'form-control'
                                    }}
                                    id={key}
                                    onSelected={(e, option, id) => {
                                        this.onChangeColumn(e, option, id);
                                    }}
                                    disabledOptions={this.disabled}
                                    selected={selected}
                                />

                                <ul className='list-unstyled list-attr'>
                                    {element.map((item, i) => {
                                        return (
                                            <li
                                                key={`option-${i}`}
                                                title={item}
                                            >
                                                {item}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    );
                }
            }
        }

        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onHide}
                bsSize={'lg'}
                onEnter={() => {
                    Utils.toggleStatusButtons('.action-massive', true);
                }}
                onExited={() => {
                    this.setState({
                        alert: null,
                        cols: null
                    });

                    this.disabled = {};
                    this.uploaded = null;
                }}
            >
                <div className='color-line'></div>
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        {'Importar Casillas'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <form ref='form-change-passwd'>
                            <div className='row'>
                                <div className='col-xs-12 text-center'>
                                    <div className='input-group'>
                                        <label
                                            className='input-group-addon pointer'
                                            htmlFor='importer'
                                        >
                                            <input
                                                type='file'
                                                className='hide'
                                                ref='realfile'
                                                id='importer'
                                                onChange={(e) => {
                                                    this.onFileUploaded(e);
                                                }}
                                            />
                                            <i className='glyphicon glyphicon-hdd'></i>
                                            {' Importar Archivo'}
                                        </label>
                                        <input
                                            type='text'
                                            className='form-control'
                                            readOnly='readOnly'
                                            ref='console'
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className='row'>
                            <div className='col-xs-12'>
                                <div className='wrapper-importer clearfix'>
                                    {ul}
                                </div>
                            </div>
                        </div>

                        <div className='row text-center'>
                            {labelError}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className='btn btn-info action-massive'
                        type='button'
                        onClick={() => {
                            this.onSubmit();
                        }}
                    >
                        <i className='glyphicon glyphicon-open-file'></i>
                        {' Cargar Archivo'}
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}

ImportMassiveModal.propTypes = {
    show: React.PropTypes.bool.isRequired,
    onHide: React.PropTypes.func.isRequired
};
