import React from 'react';
import Datalist from 'react-datalist';
import Button from '../button.jsx';
import * as Utils from '../../utils/utils.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import Constants from '../../utils/constants.jsx';

const typeErrors = Constants.MessageType;

export default class FormAliasMailbox extends React.Component {
    constructor(props) {
        super(props);

        this.handleDeleteAlias = this.handleDeleteAlias.bind(this);
        this.sortAlias = this.sortAlias.bind(this);
        this.addAlias = this.addAlias.bind(this);
        this.toggleClass = 'glyphicon-sort-by-attributes';
        this.asc = true;

        this.state = {
            alias: this.getAlias()
        };
    }

    addAlias(e) {
        e.preventDefault();
        const refs = this.refs;
        const newAlias = refs.alias.value + '@' + refs.domain.value;

        Utils.validateInputRequired(refs).then(() => {
            this.props.data.addAccountAlias(newAlias, () => {
                GlobalActions.emitMessage({
                    message: 'Se ha agregado su nuevo Alias con éxito.',
                    type: typeErrors.SUCCESS
                });

                let alias = this.state.alias;
                alias.push(newAlias);

                this.setState({
                    alias: alias
                });
            }, (err) => {
                GlobalActions.emitMessage({
                    message: err.error,
                    type: typeErrors.ERROR
                });
            });
        }, (error) => {
            GlobalActions.emitMessage({
                message: error.message,
                type: typeErrors.ERROR
            });

            error.node.focus();
        });
    }

    sortAlias() {
        let sort;
        if (this.asc) {
            sort = this.state.alias;
            sort.sort().reverse();
            this.setState({
                alias: sort
            });
            this.asc = false;
            this.toggleClass = 'glyphicon-sort-by-attributes';
        } else {
            sort = this.state.alias;
            sort.sort();
            this.setState({
                alias: sort
            });
            this.asc = true;
            this.toggleClass = 'glyphicon-sort-by-attributes-alt';
        }
    }

    handleDeleteAlias(e, alias, index) {
        e.preventDefault();

        this.props.data.removeAccountAlias(alias, () => {
            GlobalActions.emitMessage({
                message: 'Se ha eliminado el alias éxitosamente.',
                type: typeErrors.SUCCESS
            });

            const newAlias = Utils.removeIndexFromArray(this.state.alias, index);

            this.setState({
                alias: newAlias
            });
        }, (err) => {
            GlobalActions.emitMessage({
                message: err.error,
                type: typeErrors.ERROR
            });
        });
    }

    getAlias() {
        const data = this.props.data;
        if (data.attrs.hasOwnProperty('zimbraMailAlias')) {
            if (typeof data.attrs.zimbraMailAlias === 'string') {
                return new Array(data.attrs.zimbraMailAlias);
            }

            return data.attrs.zimbraMailAlias.sort();
        }

        return [];
    }

    componentDidMount() {
        let refs = this.refs;
        refs.domain = refs.domain.refs.theInput;
        refs.domain.setAttribute('data-required', 'true');
        refs.domain.setAttribute('data-message', 'El dominio es necesario para crear el alias, verifiquelo por favor.');
    }

    render() {
        let tbody;
        let results;

        // this bellow is just for testing porpuse
        let options = ['apple', 'orange', 'pear', 'pineapple', 'melon'];

        if (this.state.alias) {
            tbody = this.state.alias.map((alias, i) => {
                return (
                    <tr
                        key={`alias-${alias}-${i}`}
                    >
                        <td>
                            <span>{alias}</span>
                            <Button
                                btnAttrs={{
                                    className: 'pull-right',
                                    title: `Borrar el siguiente Alias : ${alias}`,
                                    onClick: (e) => {
                                        this.handleDeleteAlias(e, alias, i);
                                    }
                                }}
                            >
                                <i className='fa fa-minus-circle text-danger'></i>
                            </Button>
                        </td>
                    </tr>
                );
            });
        }

        results = (
            <table className='table table-striped table-bordered table-hover dataTable no-footer'>
                <thead>
                    <tr>
                    <th>
                        {'Nombre'}
                        <span className='pull-right'>
                            <i
                                className={`glyphicon ${this.toggleClass} pull-right pointer`}
                                onClick={() => {
                                    this.sortAlias();
                                }}
                            >
                            </i>
                        </span>
                    </th>
                </tr>
                </thead>
                <tbody>
                    {tbody}
                </tbody>
            </table>
        );

        return (
            <div className='row'>
                <div className='col-xs-6'>
                    <div className='row'>
                        <form className='form-inline'>
                            <div className='col-xs-4'>
                                <div className='form-group'>
                                    <label>
                                        {'Mostrar'}
                                        <select
                                            ref='shown'
                                            className='form-control input-sm'
                                        >
                                            <option value='10'>10</option>
                                            <option value='25'>25</option>
                                            <option value='50'>50</option>
                                            <option value='100'>100</option>
                                        </select>
                                    </label>
                                </div>
                            </div>
                            <div className='col-xs-8 text-right'>
                                <label>
                                    {'Buscar'}
                                    <input
                                        type='search'
                                        className='form-control input-sm'
                                        ref='search'
                                    />
                                </label>
                            </div>
                        </form>
                    </div>

                    <div className='row'>
                        <div className='col-xs-12'>
                            {results}
                        </div>
                    </div>

                    <div className='row'>
                        <div className='col-xs-6'>
                            <div className='dataTables_info'>
                                1 al 2 de 2 resultados
                            </div>
                        </div>
                        <div className='col-xs-6 text-right'>
                            <div className='btn-group'>
                                <Button
                                    btnAttrs={
                                        {
                                            className: 'btn btn-default'
                                        }
                                    }
                                >
                                    {'Anterior'}
                                </Button>
                                <Button
                                    btnAttrs={
                                        {
                                            className: 'btn btn-default'
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
                        <Datalist
                            list='domains'
                            options={options}
                            className='form-control'
                            id='domain'
                            ref='domain'
                            placeholder='Dominio'
                        />
                        <span className='input-group-btn'>
                            <Button
                                btnAttrs={
                                    {
                                        className: 'btn btn-default',
                                        onClick: (e) => {
                                            this.addAlias(e);
                                        }
                                    }
                                }
                            >
                                Agregar alias
                            </Button>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

FormAliasMailbox.propTypes = {
    data: React.PropTypes.object
};
