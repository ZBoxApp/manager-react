// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import DomainStore from '../../stores/domain_store.jsx';

import Panel from '../panel.jsx';
import ToggleModalButton from '../toggle_modal_button.jsx';
import AddDistributionListModal from './add_distribution_list_modal.jsx';

import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';

export default class DomainDistributionList extends React.Component {
    constructor(props) {
        super(props);

        this.getLists = this.getLists.bind(this);
        this.handleRemoveAdmin = this.handleRemoveAdmin.bind(this);
        this.onListsChange = this.onListsChange.bind(this);
        this.state = this.getStateFromStores();
    }
    getStateFromStores() {
        const lists = DomainStore.getDistributionLists(this.props.domain);

        return {
            lists
        };
    }
    getLists() {
        const domain = this.props.domain;
        domain.getAllDistributionLists(
            (err, lists) => {
                DomainStore.setDistibutionLists(domain, lists);
                this.setState({lists});
            }
        );
    }
    onListsChange() {
        const lists = DomainStore.getDistributionLists(this.props.domain);
        if (!lists) {
            return this.getAdmins();
        }

        return this.setState({lists});
    }
    handleRemoveAdmin(e, list) {
        e.preventDefault();

        if (confirm(`¿Seguro quieres eliminar la lista de distribución ${list.name} del dominio?`)) { //eslint-disable-line no-alert
            Client.removeDistributionList(
                list.id,
                () => {
                    DomainStore.removeDistributionList(list.id);
                },
                (error) => {
                    this.setState({error});
                }
            );
        }
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
        if (!this.state.lists) {
            return <div/>;
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

        const listsRows = this.state.lists.map((dl) => {
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
                children={panelBody}
            />
        );
    }
}

DomainDistributionList.propTypes = {
    domain: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired
};
