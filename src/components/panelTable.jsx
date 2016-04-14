import React from 'react';
import Button from './button.jsx';
import PanelForm from './panelForm.jsx';
import Pagination from './pagination.jsx';
import Alert from './alert.jsx';

export default class PanelTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            data: [
                {name: 'zbox', casillas: '2', descripcion: 'Caracas', estado: 'active', props: {className: 'domain-row'}},
                {name: 'Nombre', casillas: '2NNS', descripcion: 'Descripción', estado: 'active', props: {className: 'domain-row'}},
                {name: 'microsoft', casillas: '34NS', descripcion: 'Solteros', estado: 'active', props: {className: 'domain-row'}},
                {name: 'descargasnsn', casillas: '2NNS', descripcion: 'Descripción', estado: 'migrando', props: {className: 'domain-row'}},
                {name: 'Nombre', casillas: '2NNS', descripcion: 'Descripción', estado: 'active', props: {className: 'domain-row'}},
                {name: 'machinesoft', casillas: '', descripcion: 'Hola que tal', estado: 'inactive', props: {className: 'domain-row'}},
                {name: 'Nombre', casillas: '2S', descripcion: 'Descripción', estado: 'active', props: {className: 'domain-row'}},
                {name: 'getonboard', casillas: '45NS', descripcion: 'Casados', estado: 'inactive', props: {className: 'domain-row'}}
            ],
            pagination: [
                {url: './domains/1', label: '1', active: 'active'},
                {url: './domains/2', label: '2'},
                {url: './domains/3', label: '3'},
                {url: './domains/prev', label: 'prev'},
                {url: './domains/next', label: 'next'}
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
                            {row.name}
                        </td>

                        <td>
                            {row.casillas}
                        </td>

                        <td>
                            {row.descripcion}
                        </td>

                        <td>
                            <span className={'label-fat label-domain-status-' + row.estado}>
                                {row.estado}
                            </span>
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
                                    <th>Nombre</th>
                                    <th>Casillas Usadas</th>
                                    <th>Descripción</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows}
                            </tbody>
                        </table>
                    </div>

                    <Pagination linksArray={this.state.pagination}/>
                </div>
            );
        }

        return (
            <div>
                <Alert
                    className='alert alert-success'
                    withClose={true}
                >
                    <a href='./goTo'>Tu datos han sido guardados!.</a>
                </Alert>
                <div className='hpanel'>
                    <div className='panel-heading hbuilt clearfix'>
                        <div className='pull-right'>{btns}</div>
                        <div className='panel-header-search'>
                            <PanelForm
                                formAttrs={{name: 'search_name', 'data-remote': true}}
                                inputAttrs={{type: 'text', name: 'search[query]', id: 'search_query', className: 'form-control', placeholder: 'Buscar Dominio Por Nombre'}}
                            />
                        </div>
                    </div>
                    <div className='panel-body'>
                        {content}
                    </div>
                </div>
            </div>
        );
    }
}

PanelTable.propTypes = {
    btnsHeader: React.PropTypes.array
};

PanelTable.defaultProps = {
    btnsHeader: []
};
