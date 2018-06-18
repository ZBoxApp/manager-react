// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import sweetAlert from 'sweetalert';

import DomainStore from '../../stores/domain_store.jsx';

import Panel from '../panel.jsx';
import ToggleModalButton from '../toggle_modal_button.jsx';
import AddDistributionListModal from './add_distribution_list_modal.jsx';

import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';
import Constants from '../../utils/constants.jsx';
const defaultLimit = Constants.QueryOptions.DEFAULT_LIMIT;
import Pagination from '../pagination.jsx';

export default class DomainDistributionList extends React.Component {
    constructor(props) {
        super(props);

        this.isStoreEnabled = window.manager_config.enableStores;
        this.getLists = this.getLists.bind(this);
        this.handleRemoveAdmin = this.handleRemoveAdmin.bind(this);
        this.onListsChange = this.onListsChange.bind(this);
        this.handleSearchByName = this.handleSearchByName.bind(this);
        this.listscache = null;

        const page = parseInt(this.props.location.query.page, 10) || 1;
        this.state = {
            lists: this.getStateFromStores(),
            page,
            offset: ((page - 1) * defaultLimit)
        };
    }
    getStateFromStores() {
        const lists = this.isStoreEnabled ? DomainStore.getDistributionLists(this.props.domain) : null;

        return lists;
    }
    getLists(label) {
        const tag = label || null;
        const domain = this.props.domain;
        let condition;
        setTimeout(() => {
            domain.getAllDistributionLists(
                (err, lists) => {
                    if (this.isStoreEnabled) {
                        DomainStore.setDistibutionLists(domain, lists);
                    }

                    if (tag === 'add') {
                        condition = this.state.length + 1;
                    }
                    if (tag === 'remove') {
                        condition = this.state.length - 1;
                    }

                    this.listscache = lists;
                    const length = lists.length;

                    if (!tag) {
                        return this.setState({
                            lists,
                            length
                        });
                    }

                    if (condition === lists.length) {
                        return this.setState({
                            lists,
                            length
                        });
                    } else {
                        this.getLists(tag);
                    }
                }
            );
        }, 100);
    }
    componentWillReceiveProps(nextProps) {
        const page = parseInt(nextProps.location.query.page, 10) || 1;
        this.setState({
            page,
            offset: ((page - 1) * defaultLimit)
        });
    }
    onListsChange(label) {
        const lists = this.isStoreEnabled ? DomainStore.getDistributionLists(this.props.domain) : null;
        if (!lists) {
            return this.getLists(label);
        }

        return this.setState({lists});
    }
    handleRemoveAdmin(e, list) {
        e.preventDefault();
        const response = {
            title: 'Se ha borrado con éxito',
            type: 'success'
        };

        sweetAlert({
                title: 'Borrar Lista de Distribución',
                text: `¿Seguro quieres eliminar la lista de distribución ${list.name} del dominio?`,
                type: 'info',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Si, deseo borrarlo!',
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            },
            (isDeleted) => {
                if (isDeleted) {
                    Client.removeDistributionList(
                        list.id,
                        () => {
                            if (this.isStoreEnabled) {
                                DomainStore.removeDistributionList(list.id);
                            } else {
                                DomainStore.emitDistributionListsChange('remove');
                            }

                            return sweetAlert(response);
                        },
                        (error) => {
                            response.title = 'Ha ocurrido un error.';
                            response.text = `${error.message}`;
                            response.type = 'error';
                            response.confirmButtonText = 'Intentar de nuevo';
                            response.confirmButtonColor = '#DD6B55';
                            return sweetAlert(response);
                        }
                    );
                }
            }
        );
    }
    handleSearchByName(e) {
        const value = e.target.value.trim();

        if (!this.listscache) {
            return null;
        }

        const newLists = this.listscache.filter((dl) => {
            const name = dl.name || dl.id;
            return name.match(value);
        });

        this.setState({
            lists: newLists
        });
    }
    componentDidMount() {
        DomainStore.addDistributionListsChangeListener(this.onListsChange);

        if (!this.state.lists) {
            this.getLists();
        }
    }
    componentWillUnmount() {
        DomainStore.removeDistributionListsChangeListener(this.onListsChange);
    }
    render() {
        let pagination = null;
        let filter = null;
        if (!this.state.lists) {
            return (
                <div
                    className='text-center'
                    key={'dl-loading'}
                >
                    <i className='fa fa-spinner fa-spin fa-4x fa-fw'></i>
                    <p>{'Cargando Listas de Distribución...'}</p>
                </div>
            );
        }

        const domain = this.props.domain;

        const headerButtons = [{
            setComponent: (
                <ToggleModalButton
                    key='lists-modal'
                    role='button'
                    className='btn btn-info add-button btn-xs'
                    dialogType={AddDistributionListModal}
                    dialogProps={{domain}}
                >
                    {'Nueva lista'}
                </ToggleModalButton>
            )
        }];

        let lists = this.state.lists;
        if (lists.length > defaultLimit) {
            const totalPages = Math.ceil(lists.length / defaultLimit);
            lists = lists.slice(this.state.offset, this.state.page * defaultLimit);
            pagination = (
                <Pagination
                    key='DlPagination'
                    url={this.props.location.pathname}
                    currentPage={this.state.page}
                    totalPages={totalPages}
                />
            );
        }

        const listsRows = lists.map((dl) => {
            return (
                <tr
                    key={`dl-${dl.id}`}
                    className='distribution-list-row'
                >
                    <td className='distribution-list-name'>
                        <h4>
                            {dl.name}
                        </h4>
                    </td>
                    <td className='distribution-list-size'>
                        {dl.members.length}
                    </td>
                    <td className='distribution-list-actions'>
                        <a
                            href='#'
                            onClick={(e) => Utils.handleLink(e, `/domains/${domain.id}/distribution_lists/${dl.id}`)}
                        >
                            {'Ver'}
                        </a>
                        {' | '}
                        <a
                            href='#'
                            onClick={(e) => this.handleRemoveAdmin(e, dl)}
                        >
                            {'Eliminar'}
                        </a>
                    </td>
                </tr>
            );
        });

        let panelBody;
        if (listsRows.length > 0) {
            filter = (
                <div className='col-xs-12'>
                    <div className='input-group'>
                        <span className='input-group-btn'>
                            <button
                                className='btn btn-primary'
                                type='button'
                            >
                                Buscar
                            </button>
                        </span>
                        <input
                            type='text'
                            className='form-control'
                            placeholder='Búsqueda por nombre'
                            onKeyUp={(e) => {
                                this.handleSearchByName(e);
                            }}
                        />
                    </div>
                </div>
            );

            panelBody = (
                <div className='table-responsive'>
                    <table
                        cellPadding='1'
                        cellSpacing='1'
                        className='table table-condensed table-striped vertical-align'
                    >
                        <thead>
                        <tr>
                            <th>{'Nombre'}</th>
                            <th className='text-center'>{'Miembros'}</th>
                            <th className='text-center'>{'Acciones'}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {listsRows}
                        </tbody>
                    </table>
                    {pagination}
                </div>
            );
        } else {
            panelBody = (
                <div className='empty-message'>
                    <h4>
                        {'Actualmente no hay listas de distribución. '}
                    </h4>
                </div>
            );
        }

        return (
            <Panel
                hasHeader={true}
                btnsHeader={headerButtons}
                filter={filter}
                children={panelBody}
            />
        );
    }
}

DomainDistributionList.propTypes = {
    domain: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
};
