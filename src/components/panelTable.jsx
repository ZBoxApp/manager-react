import React from 'react';
import Button from './button.jsx';
import Pagination from './pagination.jsx';
import Alert from './alert.jsx';

export default class PanelTable extends React.Component {
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
            content = <div className='empty-search'>{'Sin resultados para tu búsqueda'}</div>;
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
