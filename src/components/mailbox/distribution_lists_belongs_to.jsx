import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../button.jsx';
import { handleLink } from '../../utils/utils.jsx';

/* eslint-disable */
export class TableColumnHeader extends Component {
    static propTypes = {
        children: PropTypes.element
    };

    render() {
        const { children } = this.props;

        return (
            <th>
                {children}
            </th>
        );
    }
}

export class TableColumn extends Component {
    static propTypes = {
        children: PropTypes.element
    };

    render() {
        const { children } = this.props;

        return (
            <td>
                {children}
            </td>
        );
    }
}

export class TableRow extends Component {
    static propTypes = {
        children: PropTypes.element
    };

    render() {
        const { children } = this.props;

        return (
            <tr>
                {children}
            </tr>
        );
    }
}

export class Table extends Component {
    constructor(props) {
        super(props);

        this.headers = this.makeColsHeaders();
        this.rows = 0;
    }

    static defaultProps = {
        items: []
    };

    static propTypes = {
        columns: PropTypes.arrayOf(PropTypes.shape({
            title: PropTypes.element.isRequired,
            dataIndex: PropTypes.string.isRequired,
            key: PropTypes.string,
            render: PropTypes.func
        })).isRequired,
        items: PropTypes.array,
        emptyComponent: PropTypes.element
    }

    makeColsHeaders() {
        const { columns } = this.props;

        if (!columns) {
            return null;
        }

        const cols = columns.map((column, index) => {
            const { title } = column;
            return (
                <TableColumnHeader key={`col-header-${index}`}>
                    {title}
                </TableColumnHeader>
            );
        });

        return (
            <TableRow >
                {cols}
            </TableRow>
        );
    }

    getAttribute(item, key) {
        return item.attrs && item.attrs[key] || item[key];
    }

    renderRow(item, column, index) {
        this.rows++;
        const { render, dataIndex, key } = column;
        const value = this.getAttribute(item, dataIndex);
        const _key = this.getAttribute(item, key) || `col-item-${index}-rows-${this.rows}`;

        if (render && typeof render === 'function') {
            return (
                <TableColumn key={_key}>
                    {render(item, index)}
                </TableColumn>
            );
        }

        return (
            <TableColumn key={_key}>
                {value}
            </TableColumn>
        );
    }

    makeColumns() {
        const { items, columns } = this.props;

        return items.map((item, index) => {
            const cols = columns.map((column) => {
                return this.renderRow(item, column, index);
            });

            return (
                <TableRow key={`item-row-${index}`}>
                    {cols}
                </TableRow>
            );
        });
    }

    render() {
        return (
            <div className='table-responsive'>
                <table
                    id='index-dl-membership'
                    cellPadding='1'
                    cellSpacing='1'
                    className='table table-condensed table-striped vertical-align'
                >
                    <thead>
                        {this.headers}
                    </thead>

                    <tbody>
                        {this.makeColumns()}
                    </tbody>
                </table>
            </div>
        );
    }
}
const url = '/domains/null/distribution_lists/:id';
const columns = [
    {
        title: 'Nombre',
        key: 'name',
        render: function render(item) {
            const { id, name } = item;
            return (
                <Button
                    key={id}
                    btnAttrs={
                        {
                            className: 'btn btn-xs',
                            onClick: (e) => handleLink(e, url.replace(':id', id))
                        }
                    }
                >
                    {name}
                </Button>
            );
        }
    },
    {
        title: '¿ Es Miembro Directo ?',
        render: (item) => {
            const { via } = item;
            return via ? `Indirecto (${via})` : 'Directo';
        }
    }
];

export default class DistributionListsBelongsTo extends Component {
    static propTypes = {
        items: PropTypes.array
    }

    render() {
        const { items } = this.props;

        if (items && items.length > 0) {
            return (
                <Table
                    items={items}
                    columns={columns}
                />
            );
        }

        return (
            <div>
                <h2>
                    {'No pertenece a ninguna Lista de Distribución'}
                </h2>
            </div>
        );
    }
}
