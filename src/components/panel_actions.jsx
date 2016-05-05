//import Datalist from 'react-datalist';
import React from 'react';
import Button from './button.jsx';
import PaginateArray from '../stores/paginate_array_store.jsx';
import DataList from 'react-datalist';
import * as Utils from '../utils/utils.jsx';
import * as GlobalActions from '../action_creators/global_actions.jsx';
import Constants from '../utils/constants.jsx';

const messageType = Constants.MessageType;

export default class PanelActions extends React.Component {
    constructor(props) {
        super(props);

        this.handleDelete = this.handleDelete.bind(this);
        this.handleAddNew = this.handleAddNew.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeLimit = this.handleChangeLimit.bind(this);
        this.handleOnExport = this.handleOnExport.bind(this);
        this.onSearch = this.onSearch.bind(this);

        this.reset = this.reset.bind(this);
        this.next = this.next.bind(this);
        this.prev = this.prev.bind(this);

        const limit = 10;
        this.pagination = new PaginateArray(this.props.data, limit, 1);

        this.add = [];
        this.remove = [];
        this.forAdd = [];
        this.forRemove = [];
        this.refresh = [];

        const states = {};

        states['items' + this.props.name] = this.pagination.init();
        states['pagination' + this.props.name] = this.pagination.getResults();

        this.state = states;
    }

    handleOnExport(e) {
        e.preventDefault();

        if (this.props.onExport) {
            return this.props.onExport(this.state['items' + this.props.name]);
        }

        throw new Error('onExport function was not defined, onExport :' + this.props.onExport);
    }

    onSearch() {
        const search = this.refs.search.value;

        const arrayFiltered = this.props.data.filter((strArray) => {
            if (strArray.match(search)) {
                return strArray;
            }

            return false;
        });

        const states = {};

        this.pagination.setArray(arrayFiltered);
        this.pagination.reset();

        states['items' + this.props.name] = this.pagination.init();
        states['pagination' + this.props.name] = this.pagination.getResults();

        this.setState(states);
    }

    prev() {
        const prev = this.pagination.prevPage();
        if (prev) {
            const states = {};

            states['items' + this.props.name] = prev;
            states['pagination' + this.props.name] = this.pagination.getResults();

            this.setState(states);
        }
    }

    next() {
        const next = this.pagination.nextPage();
        if (next) {
            const states = {};

            states['items' + this.props.name] = next;
            states['pagination' + this.props.name] = this.pagination.getResults();

            this.setState(states);
        }
    }

    handleDelete(e, item) {
        e.preventDefault();
        this.remove.push(item);
        this.forRemove.push(item);
        this.props.onDelete(item);
    }

    reset() {
        this.add = [];
        this.remove = [];
        this.forAdd = [];
        this.forRemove = [];

        const states = {};

        states['change' + this.props.name] = true;

        this.setState(states);
    }

    handleAddNew(e) {
        e.preventDefault();
        let item = null;

        Utils.validateInputRequired(this.refs).then(() => {
            if (this.props.hasComboInput) {
                const domain = document.querySelector('input[list=\'domain\']');

                if (domain.value === '') {
                    GlobalActions.emitMessage({
                        error: 'El dominio es requerido, verifique por favor.',
                        typeError: messageType.ERROR
                    });

                    domain.focus();

                    return false;
                }

                item = this.refs.addInput.value + '@' + domain.value;

                if (this.props.isEmail) {
                    const emailPattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                    const test = emailPattern.test(item);
                    if (!test) {
                        GlobalActions.emitMessage({
                            error: 'El correo no es correcto, verifiquelo por favor.',
                            typeError: messageType.ERROR
                        });

                        return false;
                    }
                }

                this.add.push(item);
                this.forAdd.push(item);
            } else {
                item = this.refs.addInput.value;

                if (this.props.isEmail) {
                    const emailPattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                    const test = emailPattern.test(item);
                    if (!test) {
                        GlobalActions.emitMessage({
                            error: 'El correo no es correcto, verifíquelo por favor.',
                            typeError: messageType.ERROR
                        });

                        this.refs.addInput.focus();

                        return false;
                    }
                }

                this.refs.addInput.value = '';
                this.add.push(item);
                this.forAdd.push(item);
            }

            const states = {};

            states['change' + this.props.name] = true;

            this.setState(states);

            return true;
        }).catch((error) => {
            GlobalActions.emitMessage({
                error: error.message,
                typeError: messageType.ERROR
            });

            error.node.focus();
        });
    }

    componentWillReceiveProps(nextProps) {
        this.pagination.setArray(nextProps.data);
        this.pagination.reset();

        const states = {};

        states['items' + this.props.name] = nextProps.data;
        states['pagination' + this.props.name] = this.pagination.getResults();

        this.setState(states);
    }

    handleChangeLimit() {
        const limit = this.refs.countItems.value;
        this.pagination.setLimit(limit);
        this.pagination.reset();

        const states = {};

        states['items' + this.props.name] = this.pagination.init();
        states['pagination' + this.props.name] = this.pagination.getResults();

        this.setState(states);
    }

    handleChange(e, item, action) {
        if (action === 'remove') {
            if (e.target.checked) {
                this.forRemove.push(item);
                this.getOutItemFromArray(this.refresh, item);
            } else {
                this.getOutItemFromArray(this.forRemove, item);
                this.refresh.push(item);
            }

            return null;
        }

        if (e.target.checked) {
            this.forAdd.push(item);
        } else {
            this.getOutItemFromArray(this.forAdd, item);
        }

        return null;
    }

    getOutItemFromArray(array, item) {
        const length = array.length;
        if (length > 0) {
            for (let i = 0; i < length; i++) {
                if (item === array[i]) {
                    array.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }

    handleCancel() {
        this.props.onCancel(this.remove);
        this.remove = [];
        this.add = [];
        this.forRemove = [];
        this.forAdd = [];

        const states = {};

        states['change' + this.props.name] = true;

        this.setState(states);
    }

    onSubmit() {
        const response = {};
        response.reset = this.reset;

        this.refs.savebutton.setAttribute('disabled', 'disabled');
        this.refs.savebutton.innerHTML = 'Aplicando Cambios...';

        if (this.forAdd.length > 0) {
            response.add = this.forAdd;
        }

        if (this.forRemove.length > 0) {
            response.remove = this.forRemove;
        }

        if (this.refresh.length > 0) {
            response.refresh = this.refresh;
        }

        this.props.onApplyChanges(response);
    }

    render() {
        let rows = null;
        let showName = `Agregar ${this.props.name}`;
        let itemsForRemove = [];
        let itemsForAdd = [];
        let actionButtons = null;
        let pagination = null;
        let buttonExport = null;
        let input = (
            <div className='input-group'>
                <input
                    type='text'
                    className='form-control'
                    placeholder={`${this.props.name}`}
                    ref='addInput'
                    data-required='true'
                    data-message={`${this.props.name} no pueda estar vacio, verifique por favor`}
                />
                <span className='input-group-btn'>
                    <Button
                        btnAttrs={
                        {
                            className: 'btn btn-default pending_actions',
                            onClick: (e) => {
                                this.handleAddNew(e);
                            }
                        }
                        }
                    >
                        {showName}
                    </Button>
                </span>
            </div>
        );

        if (this.props.hasComboInput) {
            input = (
                <div className='input-group'>
                    <input
                        type='text'
                        ref='addInput'
                        className='form-control'
                        placeholder={this.props.name}
                        data-required='true'
                        data-message={`${this.props.name} no pueda estar vacio, verifique por favor`}
                    />
                    <span className='input-group-addon'>
                        {'@'}
                    </span>
                    <DataList
                        list='dominio'
                        options={this.props.options}
                        placeHolder='Dominio'
                    />
                    <span className='input-group-btn'>
                        <Button
                            btnAttrs={
                                {
                                    className: 'btn btn-default pending_actions',
                                    onClick: this.handleAddNew
                                }
                            }
                        >
                            {showName}
                        </Button>
                    </span>
                </div>
            );
        }

        if (this.state['items' + this.props.name] === 'undefined' || this.state['items' + this.props.name].length < 1) {
            rows = (
                <tr>
                    <td className='text-center'>
                        <strong>
                            {`No hay resultados para ${Utils.titleCase(this.props.name)}`}
                        </strong>
                    </td>
                </tr>
            );
        } else {
            const data = this.state['items' + this.props.name];
            rows = data.map((row, index) => {
                return (
                    <tr key={index}>
                        <td>
                            {row}

                            <Button
                                btnAttrs={
                                    {
                                        className: 'pull-right',
                                        onClick: (e) => {
                                            this.handleDelete(e, row);
                                        }
                                    }
                                }
                            >
                                <i className='fa fa-minus-circle text-danger'></i>
                            </Button>
                        </td>
                    </tr>
                );
            });
        }

        // make list adding / removing items
        if (this.add.length > 0 || this.remove.length > 0) {
            actionButtons = (
                <div className='actions-buttons text-right'>
                    <button
                        className='btn btn-default pending_actions'
                        onClick={this.handleCancel}
                    >
                        {'Cancelar'}
                    </button>

                    <button
                        className='btn btn-primary pending_actions applyButtons'
                        onClick={() => {
                            this.onSubmit();
                        }}
                        ref='savebutton'
                    >
                        {'Guardar Cambios'}
                    </button>
                </div>
            );

            if (this.add.length > 0) {
                itemsForAdd = this.add.map((element, key) => {
                    return (
                        <label
                            className='list-inline listed-field'
                            key={`${this.props.name}labeladd${key}`}
                        >
                            <input
                                type='checkbox'
                                defaultChecked={'checked'}
                                data-value={element}
                                onChange={(e) => {
                                    this.handleChange(e, element, 'add');
                                }}
                            />
                            {element}
                        </label>
                    );
                });

                itemsForAdd = (
                    <div className='new-fields'>
                        <h5>Por Agregar</h5>
                        <div
                            className='new-fields-list'
                        >
                            {itemsForAdd}
                        </div>
                    </div>
                );
            }

            if (this.remove.length > 0) {
                itemsForRemove = this.remove.map((element, key) => {
                    return (
                        <label
                            className='list-inline listed-field'
                            key={`${this.props.name}labelremove${key}`}
                        >
                            <input
                                type='checkbox'
                                defaultChecked={'checked'}
                                data-value={element}
                                onChange={(e) => {
                                    this.handleChange(e, element, 'remove');
                                }}
                            />
                            {element}
                        </label>
                    );
                });

                itemsForRemove = (
                    <div className='new-fields'>
                        <h5>Por Eliminar</h5>
                        <div
                            className='new-fields-list'
                        >
                            {itemsForRemove}
                        </div>
                    </div>
                );
            }
        }

        if (this.state['pagination' + this.props.name]) {
            pagination = this.state['pagination' + this.props.name];
        }

        if (this.props.hasExport && this.state['items' + this.props.name].length > 0) {
            const icon = (
                <div>
                    <i className='fa fa-download'/>
                    <span>{'Exportar'}</span>
                </div>
            );
            buttonExport = (
                <Button
                    btnAttrs={
                        {
                            className: 'btn btn-default',
                            onClick: (e) => {
                                this.handleOnExport(e);
                            }
                        }
                    }
                >
                    {icon}
                </Button>
            );
        }

        return (
            <div>
                <div className='row'>
                    <div className='col-xs-6 clearfix'>
                        <div className='row'>
                            <form className='form-inline'>
                                <div className='col-xs-4'>
                                    <div className='form-group'>
                                        <label htmlFor='select-pages'>
                                            {'Mostrar'}
                                            <select
                                                id='select-pages'
                                                className='form-control input-sm margin-left'
                                                ref='countItems'
                                                onChange={this.handleChangeLimit}
                                            >
                                                <option value='10'>{'10'}</option>
                                                <option value='25'>{'25'}</option>
                                                <option value='50'>{'50'}</option>
                                                <option value='100'>{'100'}</option>
                                            </select>
                                        </label>
                                    </div>
                                </div>

                                <div className='col-xs-8 text-right'>
                                    <label htmlFor='search'>
                                        {'Buscar'}
                                        <input
                                            type='text'
                                            className='form-control input-sm margin-left'
                                            ref='search'
                                            onKeyUp={() => {
                                                this.onSearch();
                                            }}
                                        />
                                    </label>
                                </div>
                            </form>
                        </div>

                        <div className='col-xs-12'>
                            <div className='row'>
                                <table className='table table-striped table-bordered table-hover dataTable no-footer'>
                                    <thead>
                                        <tr>
                                            <th>
                                                {'Nombre'}

                                                <span className='pull-right'>
                                                    <i
                                                        className='glyphicon pull-right pointer'
                                                    >
                                                    </i>
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {rows}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className='col-xs-12 clearfix'>
                            <div className='row'>
                                <div className='dataTables_info pull-left'>
                                    {buttonExport}
                                </div>

                                <div className='btn-group pull-right as-table'>
                                    <span className='as-cell'>
                                        {pagination}
                                    </span>
                                    <Button
                                        btnAttrs={
                                            {
                                                className: 'btn btn-default pag-prev',
                                                onClick: () => {
                                                    this.prev();
                                                }
                                            }
                                        }
                                    >
                                        {'Anterior'}
                                    </Button>

                                    <Button
                                        btnAttrs={
                                            {
                                                className: 'btn btn-default pag-next',
                                                onClick: () => {
                                                    this.next();
                                                }
                                            }
                                        }
                                    >
                                        {'Siguiente'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='col-xs-6'>
                        <div className='col-xs-12'>
                            <div className='row'>
                                {input}
                                <div
                                    className='wrap-controls'
                                    ref='parent'
                                >
                                    {itemsForAdd}
                                    {itemsForRemove}
                                    {actionButtons}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

PanelActions.propTypes = {
    name: React.PropTypes.string.isRequired,
    onApplyChanges: React.PropTypes.func.isRequired,
    data: React.PropTypes.oneOfType([
        React.PropTypes.array,
        React.PropTypes.string
    ]),
    options: React.PropTypes.array,
    hasComboInput: React.PropTypes.bool,
    onAdd: React.PropTypes.func,
    onDelete: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    hasExport: React.PropTypes.bool,
    showNameOnButton: React.PropTypes.bool,
    onExport: React.PropTypes.func,
    isEmail: React.PropTypes.bool
};

PanelActions.defaultProps = {
    hasComboInput: false,
    hasExport: false,
    showNameOnButton: true,
    options: [],
    isEmail: false
};
