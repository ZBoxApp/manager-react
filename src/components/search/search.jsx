import React from 'react';
import PageInfo from '../page_info.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import * as Client from '../../utils/client.jsx';
import Button from '../button.jsx';
import * as Utils from '../../utils/utils.jsx';
import Panel from '../panel.jsx';

export default class SearchView extends React.Component {
    constructor(props) {
        super(props);

        this.makeSearch = this.makeSearch.bind(this);

        this.state = {};
    }

    componentDidMount() {
        GlobalActions.emitEndLoading();
        const query = this.props.params.query;
        this.makeSearch(query);
    }

    componentWillReceiveProps(newProps) {
        //const condition = (newProps.params.query !== this.props.params.query);
        GlobalActions.emitEndLoading();
        const query = newProps.params.query;
        this.makeSearch(query);
    }

    makeSearch(query) {
        this.setState({
            loading: true
        });
        Client.search({
            query: `(|(mail=*${query}*)(cn=*${query}*)(sn=*${query}*)(gn=*${query}*)(displayName=*${query}*)(zimbraMailDeliveryAddress=*${query}*)(zimbraDomainName=*${query}*)(uid=*${query}*)(zimbraMailAlias=*${query}*)(uid=*${query}*)(zimbraDomainName=*${query}*)(cn=*${query}*))`,
            types: 'accounts,distributionlists,domains'
        }, (success) => {
            const result = [];

            for (const key in success) {
                if (success.hasOwnProperty(key)) {
                    if (key === 'dl' || key === 'domain' || key === 'account') {
                        Array.prototype.push.apply(result, success[key]);
                    }
                }
            }

            if (success.total <= 0) {
                return this.setState({
                    notfound: true,
                    loading: false
                });
            }

            return this.setState({
                result,
                loading: false
            });
        }, (error) => {
            console.log(error); //eslint-disable-line no-console
        });
    }

    render() {
        const query = this.props.params.query;
        let content = null;

        const pagelInfo = (
            <PageInfo
                titlePage='Búsqueda'
                descriptionPage={`Resultados para su búsqueda: ${query}`}
            />
        );

        if (this.state.result) {
            const data = this.state.result;
            const objectDomain = {};
            const rows = data.map((item) => {
                const type = item.constructor.name.toString().toLowerCase();
                let tipo = 'Desconocido';
                let url = null;
                const id = item.id;

                switch (type) {
                case 'domain':
                    tipo = (
                        <div>
                            <i className='fa fa-globe fa-lg'></i>
                            <span className='margin-left'>{'Dominio'}</span>
                        </div>
                    );

                    url = `/domains/${id}`;
                    objectDomain[item.name] = id;
                    break;
                case 'account':
                    tipo = (
                        <div>
                            <i className='fa fa-user fa-lg'></i>
                            <span className='margin-left'>{'Casilla'}</span>
                        </div>
                    );

                    url = `/mailboxes/${id}`;
                    break;
                case 'distributionlist': {
                    tipo = (
                        <div>
                            <i className='fa fa-users fa-lg'></i>
                            <span className='margin-left'>{'Lista de Distribución'}</span>
                        </div>
                    );

                    const dlName = item.name.indexOf('@') > -1 ? item.name.split('@').pop() : item.name;
                    let domainId = null;

                    if (objectDomain[dlName]) {
                        domainId = objectDomain[dlName];
                    } else {
                        domainId = Utils.getDomainIdFromDL(item.name, data);
                    }

                    url = `/domains/${domainId}/distribution_lists/${id}`;
                    break;
                }

                }

                return (
                    <tr
                        key={id}
                        className={'mailbox-row'}
                    >
                        <td className={'mailbox-name'}>
                            {tipo}
                        </td>

                        <td className={'mailbox-displayname'}>
                            {item.name}
                        </td>

                        <td className={'text-right'}>
                            <Button
                                btnAttrs={
                                {
                                    className: 'btn btn-xs btn-info',
                                    onClick: (e) => Utils.handleLink(e, url)
                                }
                                }
                            >
                                {'Ver'}
                            </Button>
                        </td>
                    </tr>
                );
            });

            const table = (
                <div
                    key='mailbox'
                    id='index-mailboxes-table'
                    className='table-responsive'
                >
                    <table
                        id='index-domains'
                        cellPadding='1'
                        cellSpacing='1'
                        className='table table-condensed table-striped vertical-align index-mailbox-table'
                    >
                        <thead>
                        <tr>
                            <th className='text-left'>{'Tipo'}</th>
                            <th className='td-mbxs text-left'>{'Nombre'}</th>
                            <th className='text-right'>{'Acciones'}</th>
                        </tr>
                        </thead>
                        <tbody>
                            {rows}
                        </tbody>
                    </table>
                </div>
            );

            content = (
                <Panel
                    children={table}
                    hasHeader={false}
                />
            );
        }

        if (this.state.notfound) {
            content = (
                <div className='text-center'>
                    <h4>
                        No existen resultados para su búsqueda
                    </h4>
                </div>
            );
        }

        if (this.state.loading) {
            content = (
                <div className='text-center'>
                    <i className='fa fa-spinner fa-spin fa-4x fa-fw'></i>
                    <p>{'Buscando...'}</p>
                </div>
            );
        }

        return (
            <div>
                {pagelInfo}
                <div className='content animate-panel'>
                    <div className='row'>
                        <div className='col-md-12 panel-with-tabs'>
                            {content}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

SearchView.propTypes = {
    params: React.PropTypes.object
};
