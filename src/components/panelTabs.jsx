import React from 'react';
import Button from './button.jsx';
import PanelForm from './panelForm.jsx';
import Pagination from './pagination.jsx';
import Anchor from './anchor.jsx';

export default class Panel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            data: []
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
                <Anchor
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
