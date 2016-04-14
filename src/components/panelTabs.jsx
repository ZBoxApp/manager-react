import React from 'react';
import Button from './button.jsx';
import PanelForm from './panelForm.jsx';
import Pagination from './pagination.jsx';
import Alert from './alert.jsx';
import Link from './link.jsx';

export default class Panel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            data: [
                {email: '@zbox', name: '2', type: 'Caracas', actions: [
                    {
                        props: {
                            href: '/mailboxes/8758658/edit',
                            className: 'btn btn-primary btn-xs'
                        },
                        label: 'Editar'
                    },

                    {
                        props: {
                            href: '/mailboxes/8758658/delete',
                            className: 'btn btn-danger btn-xs'
                        },
                        label: 'Eliminar'
                    }
                ], props: {className: 'domain-row'}},
                {email: '@Nombre', name: '2NNS', type: 'Descripción', actions: [
                    {
                        props: {
                            href: '/mailboxes/86767676/edit',
                            className: 'btn btn-danger btn-xs'
                        },
                        label: 'Editar'
                    }
                ], props: {className: 'domain-row'}},
                {email: '@microsoft', name: '34NS', type: 'Solteros', actions: [], props: {className: 'domain-row'}},
                {email: '@descargasnsn', name: '2NNS', type: 'Descripción', actions: [], props: {className: 'domain-row'}},
                {email: '@Nombre', name: '2NNS', type: 'Descripción', actions: [], props: {className: 'domain-row'}},
                {email: '@machinesoft', name: '', type: 'Hola que tal', actions: [], props: {className: 'domain-row'}},
                {email: '@Nombre', name: '2S', type: 'Descripción', actions: [], props: {className: 'domain-row'}},
                {email: '@getonboard', name: '45NS', type: 'Casados', actions: [], props: {className: 'domain-row'}}
            ],
            pagination: [
                {url: './domains/1', label: '1', props: {className: 'active'}},
                {url: './domains/2', label: '2'},
                {url: './domains/3', label: '3'},
                {url: './domains/prev', label: 'prev'},
                {url: './domains/next', label: 'next'}
            ],

            tabs: [
                {url: '/mailboxes', label: 'Todas (100)', props: {id: 'tab-all'}},
                {url: '/archiving', label: 'Archiving', props: {id: 'tab-archiving'}},
                {url: '/tab-basic', label: 'Básico', props: {style: {display: 'none'}}},
                {url: '/professional', label: 'Professional', props: {style: {display: 'none'}}},
                {url: '/premium', label: 'Premium', props: {style: {display: 'none'}}},
                {url: '/unknown', label: 'Sin Plan (130)', props: {id: 'tab-unknown'}},
                {url: '/locked', label: 'bloqueada (1)', props: {id: 'tab-locked'}}
            ]
        };
    }

    render() {
        const btns = this.props.btnsHeader.map((btn, i) => {
            return (
                <Button
                    btnAttrs={btn.props}
                    key={i}
                >
                    {btn.label}
                </Button>
            );
        });

        let content;

        if (this.state.data.length <= 0) {
            content = <div className='empty-search'>Sin resultados para tu búsqueda</div>;
        } else {
            const rows = this.state.data.map((row, i) => {
                return (
                    <tr
                        key={i}
                        {...row.props}
                    >
                        <td>
                            {row.email}
                        </td>

                        <td>
                            {row.name}
                        </td>

                        <td>
                            {row.type}
                        </td>

                        <td>
                            {row.actions.map((btn, j) => {
                                return (
                                    <Button
                                        key={j}
                                        btnAttrs={btn.props}
                                    >
                                        {btn.label}
                                    </Button>
                                );
                            })}
                        </td>
                    </tr>
                );
            });

            content = (
                <div>
                    <div
                        id='index-domains-table'
                        className='table-responsive'
                    >
                        <table className='table table-condensed table-striped vertical-align'>
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Nombre</th>
                                    <th>Tipo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                            {rows}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        const tab = this.state.tabs.map((li, i) => {
            return (
                <Link
                    key={i}
                    attrs={li.props}
                    url={li.url}
                    label={li.label}
                />
            );
        });

        let tabs = (
            <ul className='nav nav-tabs'>
                {tab}
            </ul>
        );

        return (
            <div
                id='index-mailboxes'
                className='col-md-12 panel-width-tabs mailboxes-index'
                data-domain=''
            >
                <Alert
                    className='alert alert-success'
                    withClose={true}
                >
                    <button>Tu datos han sido guardados! ok .</button>
                </Alert>

                <div className='hpanel'>
                    {tabs}
                    <div className='tab-content'>
                        <div
                            id='tab-index-mailboxes'
                            className='tab-pane active'
                        >
                            <div className='panel-body'>
                                <div className='panel-heading hbuilt clearfix'>
                                    <div className='pull-right'>{btns}</div>
                                    <div className='panel-header-search'>
                                        <PanelForm
                                            formAttrs={{name: 'search_name', 'data-remote': true}}
                                            inputAttrs={{type: 'text', name: 'search[query]', id: 'search_query', className: 'form-control', placeholder: 'Buscar Dominio Por Nombre'}}
                                        />
                                    </div>
                                </div>

                                {content}

                                <Pagination linksArray={this.state.pagination}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Panel.propTypes = {
    btnsHeader: React.PropTypes.array
};

Panel.defaultProps = {
    btnsHeader: []
};
