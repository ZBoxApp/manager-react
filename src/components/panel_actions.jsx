//import Datalist from 'react-datalist';
import React from 'react';
import Button from './button.jsx';
import PaginateArray from '../stores/paginate_array_store.jsx';
import * as Utils from '../utils/utils.jsx';

export default class FormAliasMailbox extends React.Component {
    constructor(props) {
        super(props);

        this.sort = this.sort.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.prevPage = this.prevPage.bind(this);
        this.handleChangeCount = this.handleChangeCount.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
        this.handleApplyChanges = this.handleApplyChanges.bind(this);
        this.transformData = this.transformData.bind(this);
        this.handlereset = this.handlereset.bind(this);

        this.add = [];
        this.remove = [];
        this.toggleClass = 'glyphicon-sort-by-attributes-alt';

        this.PaginateClass = new PaginateArray(this.props.data, 10);
        this.asc = false;

        this.state = {
            results: this.PaginateClass.getResults(),
            items: this.PaginateClass.init()
        };
    }

    nextPage() {
        let next = this.PaginateClass.nextPage();
        if (next) {
            this.setState({
                items: next,
                results: this.PaginateClass.getResults()
            });
        }
    }

    prevPage() {
        let prev = this.PaginateClass.prevPage();
        if (prev) {
            this.setState({
                items: prev,
                results: this.PaginateClass.getResults()
            });
        }
    }

    sort() {
        let sort;
        if (this.asc) {
            sort = this.props.data;
            sort.sort();
            this.PaginateClass.setArray(sort);
            this.setState({
                items: this.PaginateClass.reset(),
                results: this.PaginateClass.getResults()
            });
            this.asc = false;
            this.toggleClass = 'glyphicon-sort-by-attributes';
        } else {
            sort = this.props.data;
            sort.sort().reverse();
            this.PaginateClass.setArray(sort);
            this.setState({
                items: this.PaginateClass.reset(),
                results: this.PaginateClass.getResults()
            });
            this.asc = true;
            this.toggleClass = 'glyphicon-sort-by-attributes-alt';
        }
    }

    transformData() {
        const data = this.props.data;
        const info = [];

        for (let i = 0; i < data.length; i++) {
            const object = {};
            object[this.props.name] = data[i];
            info.push(object);
        }

        return info;
    }

    handleExport() {
        const data = this.transformData();
        Utils.exportAsCSV(data, this.props.name, true);
    }

    handleSearch() {
        const search = this.refs.search.value;

        const arrayFiltered = this.props.data.filter((strArray) => {
            if (strArray.match(search)) {
                return strArray;
            }

            return false;
        });

        this.PaginateClass.setArray(arrayFiltered);

        this.setState({
            items: this.PaginateClass.reset(),
            results: this.PaginateClass.getResults()
        });
    }

    handlereset() {
        this.setState({
            removes: null,
            adds: null
        });

        this.remove = [];
        this.add = [];
        Utils.toggleStatusButtons('.pending_actions', false);
    }

    handleCancel() {
        Reflect.apply(Array.prototype.push, this.props.data, this.remove);
        this.add = [];
        this.sort();
        this.PaginateClass.setArray(this.props.data);
        this.PaginateClass.resetTotalPage();
        this.remove = [];

        this.setState({
            removes: null,
            adds: null
        });
    }

    handleDelete(e, element, index, globalIndex) {
        e.preventDefault();

        this.remove.push(element);
        this.state.items.splice(index, 1);
        this.props.data.splice(globalIndex, 1);
        this.PaginateClass.setArray(this.props.data);
        this.PaginateClass.resetTotalPage();

        this.setState({
            removes: this.remove,
            items: this.state.items,
            results: this.PaginateClass.getResults()
        });
    }

    componentWillReceiveProps(nextProps) {
        this.PaginateClass.setArray(nextProps.data);

        this.setState({
            items: this.PaginateClass.reset()
        });
    }

    handleApplyChanges(e) {
        e.preventDefault();

        let response = {
            reset: this.handlereset
        };

        this.refs.savebutton.innerHTML = 'Aplicando Cambios';
        Utils.toggleStatusButtons('.pending_actions', true);

        if (this.refs.remove) {
            const toRemove = this.refs.remove.querySelectorAll('input');
            let remove = [];
            let length = toRemove.length;

            for (;length-- > 0;) {
                if (toRemove[length].hasAttribute('data-value') && toRemove[length].getAttribute('data-value') !== '' && toRemove[length].checked) {
                    remove.push(toRemove[length].getAttribute('data-value'));
                }
            }

            if (remove.length > 0) {
                response.remove = remove;
            }
        }

        if (this.refs.add) {
            const toAdd = this.refs.add.querySelectorAll('input');
            let add = [];
            let length = toAdd.length;

            for (;length-- > 0;) {
                if (toAdd[length].hasAttribute('data-value') && toAdd[length].getAttribute('data-value') !== '' && toAdd[length].checked) {
                    add.push(toAdd[length].getAttribute('data-value'));
                }
            }

            if (add.length > 0) {
                response.add = add;
            }
        }

        this.props.onApplyChanges(response);
    }

    handleAdd(e) {
        e.preventDefault();

        this.add.push(this.refs.addInput.value);
        this.refs.addInput.value = '';

        this.setState({
            adds: this.add
        });
    }

    handleChangeCount() {
        this.PaginateClass.setLimit(this.refs.countItems.value);
        this.setState({
            items: this.PaginateClass.reset(),
            results: this.PaginateClass.getResults()
        });
    }

    render() {
        let actionButtons = null;
        let btnExport;
        let data;
        let pendingFieldsToAdd = null;
        let pendingFieldsToRemove = null;
        const showName = (this.props.showNameOnButton) ? `Agregar ${this.props.name}` : 'Agregar';

        if (this.state.items) {
            data = this.state.items.map((str, i) => {
                return (
                    <tr
                        key={i}
                    >
                        <td>
                            {str}

                            <Button
                                btnAttrs={
                                    {
                                        className: 'pull-right',
                                        onClick: (e) => {
                                            this.handleDelete(e, str, i, (i + this.PaginateClass.offset));
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

            if (data.length < 0) {
                data = (<tr><td className='text-center'>{'No ha resultados'}</td></tr>);
            }
        }

        if (this.state.adds || this.state.removes) {
            actionButtons = (
                <div className='actions-buttons text-right'>
                    <button
                        className='btn btn-default pending_actions'
                        onClick={this.handleCancel}
                    >
                        {'Cancelar'}
                    </button>

                    <button
                        className='btn btn-primary pending_actions'
                        onClick={this.handleApplyChanges}
                        ref='savebutton'
                    >
                        {'Guardar Cambios'}
                    </button>
                </div>
            );
        }

        if (this.state.adds) {
            const list = this.state.adds.map((element, key) => {
                return (
                    <label
                        className='list-inline listed-field'
                        key={`${this.props.name}labeladd${key}`}
                    >
                        <input
                            type='checkbox'
                            defaultChecked={'checked'}
                            data-value={element}
                            key={`${this.props.name}checkboxAdd${key}`}
                        />
                        {element}
                    </label>
                );
            });
            const addBox = (
                <div className='new-fields'>
                    <h5>Por Agregar</h5>
                    <div
                        className='new-fields-list'
                        ref='add'
                    >
                        {list}
                    </div>
                </div>
            );

            pendingFieldsToAdd = addBox;
        }

        if (this.state.removes) {
            const list = this.state.removes.map((element, key) => {
                return (
                    <label
                        className='list-inline listed-field'
                        key={`${this.props.name}labelremove${key}`}
                    >
                        <input
                            type='checkbox'
                            defaultChecked={'checked'}
                            data-value={element}
                            key={`${this.props.name}checkboxRemove${key}`}
                        />
                        {element}
                    </label>
                );
            });
            const removeBox = (
                <div className='new-fields'>
                    <h5>Por Eliminar</h5>
                    <div
                        className='new-fields-list'
                        ref='remove'
                    >
                        {list}
                    </div>
                </div>
            );

            pendingFieldsToRemove = removeBox;
        }

        let input = (
            <div className='input-group'>
                <input
                    type='text'
                    className='form-control'
                    placeholder={`${this.props.name}`}
                    ref='addInput'
                />
                <span className='input-group-btn'>
                    <Button
                        btnAttrs={
                        {
                            className: 'btn btn-default pending_actions',
                            onClick: (e) => {
                                this.handleAdd(e);
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
                        ref='alias'
                        className='form-control'
                        placeholder='Alias'
                        data-required='true'
                        data-message='El alias es requerido, compruebelo por favor'
                    />
                <span className='input-group-addon'>
                    @
                </span>
                <span className='input-group-btn'>
                    <Button
                        btnAttrs={
                            {
                                className: 'btn btn-default pending_actions',
                                onClick: (e) => {
                                    this.addAlias(e);
                                }
                            }
                        }
                    >
                        {showName}
                    </Button>
                </span>
                </div>
            );
        }

        if (this.props.hasExport) {
            btnExport = (
                <Button
                    btnAttrs={
                        {
                            className: 'btn btn-default',
                            onClick: this.handleExport
                        }
                    }
                >
                    {'Exportar'}
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
                                                onChange={this.handleChangeCount}
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
                                            onKeyUp={this.handleSearch}
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
                                                        className={`glyphicon ${this.toggleClass} pull-right pointer`}
                                                        onClick={this.sort}
                                                    >
                                                    </i>
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {data}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className='col-xs-12 clearfix'>
                            <div className='row'>
                                <div className='dataTables_info pull-left'>
                                    {btnExport}
                                </div>

                                <div className='btn-group pull-right as-table'>
                                    <span className='as-cell'>
                                        {this.state.results}
                                    </span>
                                    <Button
                                        btnAttrs={
                                            {
                                                className: 'btn btn-default',
                                                onClick: () => {
                                                    this.prevPage();
                                                }
                                            }
                                        }
                                    >
                                        {'Anterior'}
                                    </Button>

                                    <Button
                                        btnAttrs={
                                            {
                                                className: 'btn btn-default',
                                                onClick: () => {
                                                    this.nextPage();
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
                                    {pendingFieldsToAdd}
                                    {pendingFieldsToRemove}
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

FormAliasMailbox.propTypes = {
    name: React.PropTypes.string.isRequired,
    data: React.PropTypes.array,
    hasComboInput: React.PropTypes.bool,
    onAdd: React.PropTypes.func,
    onDelete: React.PropTypes.func,
    hasExport: React.PropTypes.bool,
    onApplyChanges: React.PropTypes.func.isRequired,
    showNameOnButton: React.PropTypes.bool,
    onExport: React.PropTypes.func
};

FormAliasMailbox.defaultProps = {
    hasComboInput: false,
    hasExport: false,
    showNameOnButton: true
};
