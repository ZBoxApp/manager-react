import React from 'react';
import * as Utils from '../../utils/utils.jsx';
import Constants from '../../utils/constants.jsx';
import EventStore from '../../stores/event_store.jsx';
import DomainStore from '../../stores/domain_store.jsx';
import Client from '../../utils/client.jsx';

const Labels = Constants.Labels;

const MessageType = Constants.MessageType;

export default class DNSZoneForm extends React.Component {
    constructor(props) {
        super(props);

        this.addDNSRow = this.addDNSRow.bind(this);
        this.removeRow = this.removeRow.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.addDNSRequest = this.addDNSRequest.bind(this);
        this.zoneDNSChange = this.zoneDNSChange.bind(this);

        this.zoneDNS = DomainStore.getZoneDNS();

        this.instanceRow = {
            name: '',
            type: Constants.typesOfDNS[0],
            content: '',
            priority: 10,
            ttl: 86400,
            disabled: false
        };

        this.defaultRows = this.getRecords();

        this.types = Constants.typesOfDNS;

        this.state = {
            fields: this.defaultRows
        };
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
        const request = {
            name: this.props.domain.name,
            kind: 'Master',
            nameservers: []
        };

        Utils.toggleStatusButtons('.savedns', true);
        const button = this.refs.savedns;
        const oldContent = button.innerHTML;
        button.innerHTML = '<i class=\'fa fa-spinner fa-spin\'></i> Creando Zona DNS';

        if (zoneDNS) {
            zoneDNS.createOrModifyRecords(records, (err, data) => {
                if (err) {
                    Utils.toggleStatusButtons('.savedns', false);
                    button.innerHTML = oldContent;

                    return EventStore.emitMessage({
                        message: err.reason,
                        typeError: MessageType.ERROR
                    });
                }

                DomainStore.setZoneDNS(data);

                Utils.toggleStatusButtons('.savedns', false);
                button.innerHTML = oldContent;

                return EventStore.emitMessage({
                    message: 'Se ha registrado su nuevo DNS éxitoxamente.',
                    typeError: MessageType.SUCCESS
                });
            });
        }

        Client.createZoneWithRecords(request, records, () => {
            Utils.toggleStatusButtons('.savedns', false);
            button.innerHTML = oldContent;

            EventStore.emitMessage({
                message: 'Se ha creado su zona DNS éxitosamente.',
                typeError: MessageType.SUCCESS
            });
        }, (error) => {
            EventStore.emitMessage({
                message: error.extra.reason,
                typeError: MessageType.ERROR
            });

            Utils.toggleStatusButtons('.savedns', false);
            button.innerHTML = oldContent;
        });
    }

    addDNSRow() {
        const copy = Object.assign({}, this.instanceRow);
        copy.enabled = true;
        this.defaultRows.push(copy);

        this.setState({
            fields: this.defaultRows
        });
    }

    removeRow(e, index) {
        e.preventDefault();
        const zoneDNS = this.zoneDNS;
        const button = e.target;
        const old = button.innerHTML;
        button.innerHTML = '<i class=\'fa fa-spinner fa-spin\'></i>';
        button.setAttribute('disabled', 'disabled');

        if (this.defaultRows[index]) {
            if (zoneDNS && zoneDNS.records[index]) {
                return zoneDNS.deleteRecords(this.defaultRows[index], (error, success) => {
                    if (error) {
                        button.removeAttribute('disabled');
                        button.innerHTML = old;

                        return EventStore.emitMessage({
                            message: error.message,
                            typeError: MessageType.ERROR
                        });
                    }

                    const name = this.defaultRows[index].name;
                    DomainStore.setZoneDNS(success);

                    return EventStore.emitMessage({
                        message: `Se ha borrado su DNS ${name} éxitoxamente.`,
                        typeError: MessageType.ERROR
                    });
                });
            }

            this.defaultRows.splice(index, 1);

            this.setState({
                fields: this.defaultRows
            });
        }

        return false;
    }

    handleChangeInput(e, index, ref) {
        const value = e.target.value;
        if (this.defaultRows[index]) {
            this.defaultRows[index][ref] = value;
            return true;
        }

        return false;
    }

    zoneDNSChange() {
        this.zoneDNS = DomainStore.getZoneDNS();

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

    render() {
        const textButton = this.zoneDNS ? 'Agregar otro registro' : 'Crear zona DNS';
        let isVisible = false;
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
                <h4>No existen Zonas DNS para su dominio : <strong>{this.props.domain.name}</strong></h4>
            </div>
        );

        if (this.defaultRows.length > 0) {
            isVisible = true;
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
                                onChange={(e) => {
                                    this.handleChangeInput(e, i, Labels.name);
                                }}
                                disabled={isDisabled}
                            />
                        </div>

                        <div className='col-xs-1'>
                            <select
                                className='form-control'
                                defaultValue={element.type}
                                onChange={(e) => {
                                    this.handleChangeInput(e, i, Labels.type);
                                }}
                                disabled={isDisabled}
                            >
                                {types}
                            </select>
                        </div>

                        <div className='col-xs-3'>
                            <input
                                type='text'
                                className='form-control'
                                defaultValue={element.content}
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
                        <button
                            className='btn btn-info pull-right'
                            onClick={this.addDNSRow}
                        >
                            <i className='fa fa-plus-circle fa-lg'></i> {textButton}
                        </button>
                    </p>
                </blockquote>

                <form>
                    {header}
                    {fields}
                    <br/>
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
    domain: React.PropTypes.object
};
