import React from 'react';
import {FormGroup, Button, FormControl, InputGroup} from 'react-bootstrap';
import sweetAlert from 'sweetalert';
import * as Utils from '../../utils/utils.jsx';
import Constants from '../../utils/constants.jsx';

//import * as GlobalActions from '../../action_creators/global_actions.jsx';
import EventStore from '../../stores/event_store.jsx';
import DomainStore from '../../stores/domain_store.jsx';
import * as Client from '../../utils/client.jsx';
import Pagination from '../pagination.jsx';

const Labels = Constants.Labels;

//const MessageType = Constants.MessageType;

export default class DNSZoneForm extends React.Component {
    constructor(props) {
        super(props);

        this.isStoreEnabled = window.manager_config.enableStores;
        this.addDNSRow = this.addDNSRow.bind(this);
        this.removeRow = this.removeRow.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.addDNSRequest = this.addDNSRequest.bind(this);
        this.zoneDNSChange = this.zoneDNSChange.bind(this);
        this.showSweetConfirm = this.showSweetConfirm.bind(this);
        this.handleSearchByName = this.handleSearchByName.bind(this);

        this.zoneDNS = this.isStoreEnabled ? DomainStore.getZoneDNS() : this.props.zone;

        this.instanceRow = {
            name: '',
            type: Constants.typesOfDNS[0],
            content: '',
            priority: 10,
            ttl: 86400,
            disabled: false
        };

        this.defaultRows = this.getRecords();
        this.newRows = [];
        this.DEFAULT_LIMIT = Constants.QueryOptions.DEFAULT_LIMIT;

        this.types = Constants.typesOfDNS;
        const page = parseInt(this.props.location.query.page, 10) || 1;

        this.state = {
            fields: this.defaultRows,
            page,
            offset: ((page - 1) * Constants.QueryOptions.DEFAULT_LIMIT)
        };
    }

    handleSearchByName(e) {
        const value = e.target.value.trim();
        const isSearching = value === '' ? null : true;
        const rowsFiltered = this.defaultRows.filter((item) => {
            const string = item.name;
            if (string.indexOf(value) > -1) {
                return true;
            }

            return false;
        });

        this.setState({
            fields: rowsFiltered,
            isSearching
        });
    }

    getRecords() {
        const records = [];
        const zoneRecords = this.zoneDNS;

        if (zoneRecords) {
            zoneRecords.records.forEach((zone) => {
                const newObject = {};
                Object.assign(newObject, this.instanceRow, zone);
                records.push(newObject);
            });
        }
        return records;
    }

    addDNSRequest() {
        const records = this.defaultRows;
        const zoneDNS = this.zoneDNS;
        const domain = this.props.domain;
        const template = window.manager_config.dns.template;
        const request = {
            name: domain.name,
            template
        };

        if (this.newRows.length > 0) {
            Array.prototype.push.apply(records, this.newRows);
        }

        Utils.toggleStatusButtons('.savedns', true);
        const button = this.refs.savedns;
        const oldContent = button.innerHTML;
        button.innerHTML = '<i className=\'fa fa-spinner fa-spin\'></i> Creando Zona DNS';
        if (zoneDNS) {
            return zoneDNS.createOrModifyRecords(records, (err) => {
                if (err) {
                    Utils.toggleStatusButtons('.savedns', false);
                    button.innerHTML = oldContent;

                    return EventStore.emitToast({
                        type: 'error',
                        title: 'Error',
                        body: err.reason,
                        options: {
                            timeOut: 5000,
                            extendedTimeOut: 2500,
                            closeButton: true
                        }
                    });
                }

                return Client.getZone(domain.name, (zone) => {
                    this.newRows = [];

                    if (this.isStoreEnabled) {
                        DomainStore.setZoneDNS(zone);
                    } else {
                        DomainStore.emitZoneDNSChange(zone);
                    }

                    Utils.toggleStatusButtons('.savedns', false);
                    button.innerHTML = oldContent;

                    return EventStore.emitToast({
                        type: 'success',
                        title: 'Creación Zona DNS',
                        body: 'Se ha registrado su nuevo DNS éxitoxamente.',
                        options: {
                            timeOut: 6000,
                            extendedTimeOut: 2500,
                            closeButton: true
                        }
                    });
                }, () => {
                    return EventStore.emitToast({
                        type: 'error',
                        title: 'Creación Zona DNS',
                        body: 'Ha ocurrido un error al recuperar su zona DNS',
                        options: {
                            timeOut: 6000,
                            extendedTimeOut: 2500,
                            closeButton: true
                        }
                    });
                });
            });
        }

        Client.createZoneWithRecords(request, records, () => {
            Utils.toggleStatusButtons('.savedns', false);
            button.innerHTML = oldContent;

            return EventStore.emitToast({
                type: 'success',
                title: 'Creación Zona DNS',
                body: 'Se ha creado su zona DNS éxitosamente.',
                options: {
                    timeOut: 5000,
                    extendedTimeOut: 2500,
                    closeButton: true
                }
            });
        }, (error) => {
            Utils.toggleStatusButtons('.savedns', false);
            button.innerHTML = oldContent;

            return EventStore.emitToast({
                type: 'error',
                title: 'Creación Zona DNS',
                body: error.extra.reason,
                options: {
                    timeOut: 5000,
                    extendedTimeOut: 2500,
                    closeButton: true
                }
            });
        });
    }

    addDNSRow() {
        const copy = Object.assign({}, this.instanceRow);
        copy.enabled = true;
        this.newRows.push(copy);

        this.setState({
            update: true
        });
    }

    showSweetConfirm(object, index) {
        const zoneDNS = this.zoneDNS;
        const response = {
            title: 'Se ha borrado con éxito',
            type: 'success'
        };

        sweetAlert({
                title: 'Esta seguro que desea borrar el DNS?',
                text: `Desea borrar el record ${object.name}`,
                type: 'info',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Si, deseo borrarlo!',
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            },
            (isDeleted) => {
                if (isDeleted) {
                    if (zoneDNS) {
                        return zoneDNS.deleteRecords(object, (error, success) => {
                            if (error) {
                                response.title = 'Ha ocurrido un error.';
                                response.type = 'error';
                                response.confirmButtonText = 'Intentar de nuevo';
                                response.confirmButtonColor = '#DD6B55';

                                return sweetAlert(response);
                            }

                            if (this.isStoreEnabled) {
                                DomainStore.setZoneDNS(success);
                            }

                            this.defaultRows.splice(index, 1);

                            this.setState({
                                fields: this.defaultRows
                            });

                            return sweetAlert(response);
                        });
                    }
                }
            }
        );
    }

    removeRow(e, object, i) {
        e.preventDefault();

        if (typeof object === 'object') {
            return this.showSweetConfirm(object, i);
        }

        this.newRows.splice(object, 1);

        return this.setState({
            update: true
        });
    }

    handleChangeInput(e, index, ref) {
        const value = e.target.value;
        if (this.newRows[index]) {
            this.newRows[index][ref] = value;
            return true;
        }

        return null;
    }

    zoneDNSChange(zone) {
        this.zoneDNS = zone;

        this.defaultRows = this.getRecords();

        this.setState({
            fields: this.defaultRows
        });
    }

    componentDidMount() {
        DomainStore.addZoneDNSChangeListener(this.zoneDNSChange);
    }

    componentWillUnmount() {
        DomainStore.addZoneDNSChangeListener(this.zoneDNSChange);
    }

    componentWillReceiveProps(newProps) {
        const condition = this.props.location.query.page !== newProps.location.query.page;

        if (condition) {
            const page = parseInt(newProps.location.query.page, 10) || 1;

            this.setState({
                page,
                offset: ((page - 1) * Constants.QueryOptions.DEFAULT_LIMIT)
            });
        }
    }

    render() {
        const textButton = this.zoneDNS ? 'Agregar otro registro' : 'Crear zona DNS';
        let isVisible = false;
        let fields = null;
        let newFields = null;
        let header = null;
        let inputSearch = null;
        let pagination = null;
        //
        // No show records
        //
        const inMutableFields = window.manager_config.dns.inmutable;
        const mutableFields = {};
        this.state.fields.forEach((record, index) => {
            if (!inMutableFields.includes(record.type.toLowerCase())) {
                mutableFields[index] = record;
            }
        });
        const mutableFieldsLength = Object.keys(mutableFields).length;
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

        if (this.state.fields.length > 0 || this.state.isSearching) {
            inputSearch = (
                <FormGroup>
                    <InputGroup>
                        <InputGroup.Button>
                            <Button bsStyle='primary'>Buscar</Button>
                        </InputGroup.Button>
                        <FormControl
                            placeholder='Búsqueda por Nombre'
                            type='text'
                            onKeyUp={this.handleSearchByName}
                        />
                    </InputGroup>
                </FormGroup>
            );
        }

        if (this.newRows.length < 1) {
            fields = (
                <div className='text-center'>
                    <h4>No existen Zonas DNS para su dominio : <strong>{this.props.domain.name}</strong></h4>
                </div>
            );
        }

        if (this.state.isSearching && this.state.fields.length === 0) {
            fields = (
                <div className='text-center'>
                    <h4>No existen Zonas DNS para su búsqueda</h4>
                </div>
            );
        }

        if (this.state.fields.length > 0 || this.newRows.length > 0) {
            isVisible = true;
            header = (
                <div className='row'>
                    <div className='col-xs-3'>
                        <strong>Nombre</strong>
                    </div>

                    <div className='col-xs-2'>
                        <strong>Tipo</strong>
                    </div>

                    <div className='col-xs-4'>
                        <strong>Contenido</strong>
                    </div>

                    <div className='col-xs-1'>
                        <strong>Prioridad</strong>
                    </div>

                    <div className='col-xs-1'>
                        <strong>TTL</strong>
                    </div>

                    <div className='col-xs-1'>
                        <strong>Acciones</strong>
                    </div>
                </div>
            );

            newFields = this.newRows.map((newElement, index) => {
                const isDisabled = newElement.enabled ? null : true;
                return (
                    <div
                        className='row set-margin-up'
                        key={`row-new-${new Date().getTime()}-${index}`}
                        id={`row-dns-new-${new Date().getTime()}-${index}`}
                    >
                        <div className='col-xs-3'>
                            <input
                                type='text'
                                defaultValue={newElement.name}
                                className='form-control'
                                onChange={(e) => {
                                    this.handleChangeInput(e, index, Labels.name);
                                }}
                                disabled={isDisabled}
                            />
                        </div>

                        <div className='col-xs-2'>
                            <select
                                className='form-control'
                                defaultValue={newElement.type}
                                onChange={(e) => {
                                    this.handleChangeInput(e, index, Labels.type);
                                }}
                                disabled={isDisabled}
                            >
                                {types}
                            </select>
                        </div>

                        <div className='col-xs-4'>
                            <input
                                type='text'
                                className='form-control'
                                defaultValue={newElement.content}
                                onChange={(e) => {
                                    this.handleChangeInput(e, index, Labels.content);
                                }}
                            />
                        </div>

                        <div className='col-xs-1'>
                            <input
                                type='number'
                                className='form-control'
                                defaultValue={newElement.priority}
                                onChange={(e) => {
                                    this.handleChangeInput(e, index, Labels.priority);
                                }}
                            />
                        </div>

                        <div className='col-xs-1'>
                            <input
                                type='number'
                                className='form-control'
                                defaultValue={newElement.ttl}
                                onChange={(e) => {
                                    this.handleChangeInput(e, index, Labels.ttl);
                                }}
                            />
                        </div>

                        <div className='col-xs-1'>
                            <button
                                className='btn btn-danger'
                                onClick={(e) => {
                                    this.removeRow(e, index);
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

            if (mutableFieldsLength > 0) {
                const length = mutableFieldsLength;
                const mutableFieldsArray = Object.keys(mutableFields);
                fields = mutableFieldsArray.map((i) => {
                    const element = mutableFields[i];
                    const isDisabled = element.enabled ? null : true;
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
                                    disabled={isDisabled}
                                />
                            </div>

                            <div className='col-xs-2'>
                                <input
                                    className='form-control'
                                    type='text'
                                    defaultValue={element.type}
                                    disabled={isDisabled}
                                />
                            </div>

                            <div className='col-xs-4'>
                                <input
                                    type='text'
                                    className='form-control'
                                    defaultValue={element.content}
                                    onChange={(e) => {
                                    this.handleChangeInput(e, i, Labels.content);
                                }}
                                />
                            </div>

                            <div className='col-xs-1'>
                                <input
                                    type='number'
                                    className='form-control'
                                    defaultValue={element.priority}
                                    onChange={(e) => {
                                    this.handleChangeInput(e, i, Labels.priority);
                                }}
                                />
                            </div>

                            <div className='col-xs-1'>
                                <input
                                    type='number'
                                    className='form-control'
                                    defaultValue={element.ttl}
                                    onChange={(e) => {
                                    this.handleChangeInput(e, i, Labels.ttl);
                                }}
                                />
                            </div>

                            <div className='col-xs-1'>
                                <button
                                    className='btn btn-danger'
                                    onClick={(e) => {
                                    this.removeRow(e, element, i);
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

                if (length > this.DEFAULT_LIMIT) {
                    fields = fields.slice(this.state.offset, (this.state.page * this.DEFAULT_LIMIT));
                    const totalPages = Math.ceil(length / this.DEFAULT_LIMIT);
                    pagination = (
                        <Pagination
                            key='panelPaginationDNS'
                            url={this.props.location.pathname}
                            currentPage={this.state.page}
                            totalPages={totalPages}
                        />
                    );
                }
            }
        }

        return (
            <div>
                <div className='row clearfix'>
                    <div className='col-xs-6'>
                        {inputSearch}
                    </div>
                    <div className='col-xs-6'>
                        <button
                            className='btn btn-info pull-right'
                            onClick={this.addDNSRow}
                        >
                            <i className='fa fa-plus-circle fa-lg'></i> {textButton}
                        </button>
                    </div>
                </div>

                <form>
                    {header}
                    {[newFields, fields, pagination]}
                    <br/>

                    <div className='col-xs-12 text-right'>
                        {(isVisible &&
                            <button
                                type='button'
                                className='btn btn-info savedns'
                                onClick={this.addDNSRequest}
                                ref='savedns'
                            >
                                {'Guardar'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        );
    }
}

DNSZoneForm.propTypes = {
    domain: React.PropTypes.object,
    zone: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.object
    ]),
    location: React.PropTypes.object
};
