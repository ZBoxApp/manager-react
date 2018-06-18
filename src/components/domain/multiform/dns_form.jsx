import React from 'react';
import PropTypes from 'prop-types';
import {browserHistory} from 'react-router';
import * as Utils from '../../../utils/utils.jsx';
import Constants from '../../../utils/constants.jsx';
import * as Client from '../../../utils/client.jsx';
import EventStore from '../../../stores/event_store.jsx';

import DomainStore from '../../../stores/domain_store.jsx';

const Labels = Constants.Labels;

const MessageType = Constants.MessageType;

export default class DNSZoneForm extends React.Component {
    constructor(props) {
        super(props);

        this.nextStep = this.nextStep.bind(this);
        this.addDNSRow = this.addDNSRow.bind(this);
        this.removeRow = this.removeRow.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.addDNSRequest = this.addDNSRequest.bind(this);

        this.instanceRow = {
            name: '',
            type: Constants.typesOfDNS[0],
            content: '',
            priority: 10,
            ttl: 86400,
            disabled: false
        };

        this.defaultRows = [
            Object.assign({}, this.instanceRow),
            Object.assign({}, this.instanceRow),
            Object.assign({}, this.instanceRow)
        ];

        this.types = Constants.typesOfDNS;

        this.state = {
            fields: this.defaultRows,
            emptyValue: ''
        };
    }

    nextStep() {
        if (this.props.state.step === this.props.state.total) {
            browserHistory.push(`/domains/${this.props.state.domain.id}`);
        } else {
            DomainStore.emitNextStep({
                step: ++this.props.state.step
            });
        }
    }

    addDNSRequest() {
        const domain = this.props.state.domain;
        const template = window.manager_config.dns.template;
        const request = {
            name: domain.name,
            template
        };

        const records = this.defaultRows;

        Utils.toggleStatusButtons('.savedns', true);
        const button = this.refs.savedns;
        const oldContent = button.innerHTML;
        button.innerHTML = '<i class=\'fa fa-spinner fa-spin\'></i> Creando Zona DNS';

        Client.getZone(this.props.state.domain.name, (zona) => {
            zona.createOrModifyRecords(records, (err) => {
                if (err) {
                    EventStore.emitMessage({
                        message: err.reason,
                        typeError: MessageType.ERROR
                    });
                    button.innerHTML = oldContent;
                    return Utils.toggleStatusButtons('.savedns', false);
                }

                return this.nextStep();
            });
        }, () => {
            Client.createZoneWithRecords(request, records, () => {
                this.nextStep();
            }, (error) => {
                EventStore.emitMessage({
                    message: error.reason,
                    typeError: MessageType.ERROR
                });
                Utils.toggleStatusButtons('.savedns', false);
                button.innerHTML = oldContent;
            });
        });
    }

    addDNSRow() {
        const copy = Object.assign({}, this.instanceRow);
        this.defaultRows.push(copy);

        this.setState({
            fields: this.defaultRows
        });
    }

    removeRow(e, index) {
        e.preventDefault();

        if (this.defaultRows[index]) {
            this.defaultRows.splice(index, 1);

            this.setState({
                fields: this.defaultRows
            });
        }

        return false;
    }

    clearInputsFromParent(parentID) {
        const parent = document.getElementById(parentID);

        if (parent) {
            const elements = parent.querySelectorAll('input, select');
            let size = elements.length;

            if (size > 0) {
                for (;size-- > 0;) {
                    if (elements[size].nodeName.toLowerCase() === 'input') {
                        elements[size].value = '';
                    } else {
                        elements[size].selectedIndex = 0;
                    }
                }
            }
        }
    }

    handleChangeInput(e, index, ref) {
        const value = e.target.value;
        if (this.defaultRows[index]) {
            this.defaultRows[index][ref] = value;
            return true;
        }

        return false;
    }

    render() {
        const textButton = this.props.state.step === this.props.state.total ? 'Saltar y Finalizar' : 'Saltar este paso';
        let fields = null;
        let header = null;

        const types = this.types.map((item) => {
            return (
                <option
                    key={item}
                    value={item}
                >
                    {item}
                </option>
            );
        });

        fields = (
            <div className='text-center'>
                <h4>No existen Zonas DNS para su dominio : <strong>{this.props.state.domain.name}</strong></h4>
            </div>
        );

        if (Array.isArray(this.defaultRows) && this.defaultRows.length > 0) {
            header = (
                <div className='row'>
                    <div className='col-xs-3'>
                        <strong>Nombre</strong>
                    </div>

                    <div className='col-xs-1'>
                        <strong>Tipo</strong>
                    </div>

                    <div className='col-xs-3'>
                        <strong>Contenido</strong>
                    </div>

                    <div className='col-xs-2'>
                        <strong>Prioridad</strong>
                    </div>

                    <div className='col-xs-2'>
                        <strong>TTL</strong>
                    </div>

                    <div className='col-xs-1'>
                        <strong>Acciones</strong>
                    </div>
                </div>
            );

            fields = this.defaultRows.map((element, i) => {
                return (
                    <div
                        className='row set-margin-up'
                        key={`row-${new Date().getTime()}-${i}`}
                        id={`row-dns-${new Date().getTime()}-${i}`}
                    >
                        <div className='col-xs-3'>
                            <input
                                type='text'
                                defaultValue={element.name}
                                className='form-control'
                                ref={`${Labels.name}-${i}`}
                                onChange={(e) => {
                                    this.handleChangeInput(e, i, Labels.name);
                                }}
                            />
                        </div>

                        <div className='col-xs-1'>
                            <select
                                className='form-control'
                                defaultValue={element.type}
                                ref={`${Labels.type}-${i}`}
                                onChange={(e) => {
                                    this.handleChangeInput(e, i, Labels.type);
                                }}
                            >
                                {types}
                            </select>
                        </div>

                        <div className='col-xs-3'>
                            <input
                                type='text'
                                className='form-control'
                                defaultValue={element.content}
                                ref={`${Labels.content}-${i}`}
                                onChange={(e) => {
                                    this.handleChangeInput(e, i, Labels.content);
                                }}
                            />
                        </div>

                        <div className='col-xs-2'>
                            <input
                                type='number'
                                className='form-control'
                                defaultValue={element.priority}
                                ref={`${Labels.priority}-${i}`}
                                onChange={(e) => {
                                    this.handleChangeInput(e, i, Labels.priority);
                                }}
                            />
                        </div>

                        <div className='col-xs-2'>
                            <input
                                type='number'
                                className='form-control'
                                defaultValue={element.ttl}
                                ref={`${Labels.ttl}-${i}`}
                                onChange={(e) => {
                                    this.handleChangeInput(e, i, Labels.ttl);
                                }}
                            />
                        </div>

                        <div className='col-xs-1'>
                            <button
                                className='btn btn-danger'
                                onClick={(e) => {
                                    this.removeRow(e, i);
                                }}
                            >
                                <i
                                    className='fa fa-trash-o'
                                    title='Delete'
                                >
                                </i>
                            </button>
                        </div>
                    </div>
                );
            });
        }

        return (
            <div>
                <blockquote className='clearfix'>
                    <p>
                        {'Editar Zona DNS para '}<strong>{this.props.state.domain.name}</strong>
                        <button
                            className='btn btn-info pull-right'
                            onClick={this.addDNSRow}
                        >
                            <i className='fa fa-plus-circle fa-lg'></i> Agregar otro registro
                        </button>
                    </p>
                </blockquote>

                <form>
                    {header}
                    {fields}

                    <br/>
                    <br/>

                    <div className='col-xs-12 text-right'>
                        <button
                            type='button'
                            className='btn btn-info savedns'
                            onClick={this.addDNSRequest}
                            ref='savedns'
                        >
                            {'Guardar'}
                        </button>

                        <button
                            type='button'
                            className='btn btn-info'
                            onClick={this.nextStep}
                        >
                            {textButton}
                        </button>
                    </div>
                </form>
            </div>
        );
    }
}

DNSZoneForm.propTypes = {
    state: PropTypes.object
};
