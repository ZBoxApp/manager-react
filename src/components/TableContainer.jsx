import React, { Component } from 'react';
import QueryString from 'query-string';
import PropTypes from 'prop-types';
import Constants from '../utils/constants.jsx';
import { Table } from './mailbox/distribution_lists_belongs_to.jsx';
import Pagination from './pagination.jsx';
import Spinner from './spinner.jsx';
const QueryOptions = Constants.QueryOptions;

export default class TableContainer extends Component {
    static defaultProps = {
        showPagination: true
    };

    static propTypes = {
        onLoad: PropTypes.func,
        params: PropTypes.object,
        location: PropTypes.object,
        columns: PropTypes.array,
        showPagination: PropTypes.bool
    };

    constructor(props) {
        super(props);

        this.state = {
            total: 0,
            loading: false,
            items: []
        };

        this.updateState = this.updateState.bind(this);
        this.getQuery = this.getQuery.bind(this);
        this.execOnLoadFunc = this.execOnLoadFunc.bind(this);
    }

    parseToNumber(value, _default) {
        const number = Number(value);
        if (isNaN(number)) {
            return _default;
        }

        return number;
    }

    getQuery(nextProps) {
        const { params, location } = nextProps || this.props;
        const { search, pathname, hash } = location;
        const query = QueryString.parse(search);

        query.page = this.parseToNumber(query.page, 1);
        query.limit = this.parseToNumber(query.limit, QueryOptions.DEFAULT_LIMIT);

        return {
            params,
            query,
            search,
            pathname,
            hash
        };
    }

    componentWillReceiveProps(nextProps) {
        const { location } = this.props;
        const { location: newLocation } = nextProps;

        if (location.pathname === newLocation.pathname) {
            this.execOnLoadFunc(nextProps);
        }
    }

    execOnLoadFunc(props) {
        const { loading } = this.state;

        // return when already is loading resources
        if (loading) {
            return;
        }

        const { onLoad } = this.props;

        if (typeof onLoad === 'function') {
            const query = this.getQuery(props);
            onLoad(query, this.updateState);
        }
    }

    componentWillMount() {
        this.execOnLoadFunc();
    }

    updateState(nextState, cb) {
        this.setState(nextState, cb);
    }

    showPagination(limit) {
        const { items, total } = this.state;
        const { showPagination } = this.props;

        return Boolean(showPagination && items && items.length > 0 && total && total > limit);
    }

    render() {
        const queryObject = this.getQuery();
        const { query, pathname } = queryObject;
        const { page, limit } = query;
        const { items, total, loading } = this.state;
        const { columns } = this.props;

        return (
            <Spinner loading={loading}>
                <div>
                    {items && items.length === 0 && !loading && (
                        <div>
                            <h2>{'No se encontraron casillas'}</h2>
                        </div>
                    )}

                    {items && items.length > 0 && (
                        <Table
                            items={items}
                            columns={columns}
                        />
                    )}

                    {this.showPagination(limit) && (
                        <Pagination
                            url={pathname}
                            currentPage={page}
                            totalPages={Math.ceil(total / limit)}
                            total={total}
                            name={'Casillas'}
                        />
                    )}
                </div>
            </Spinner>
        );
    }
}
