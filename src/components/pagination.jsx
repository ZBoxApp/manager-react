import React from 'react';
import {browserHistory} from 'react-router';

export default class Pagination extends React.Component {
    constructor(props) {
        super(props);
        this.handleFirst = this.handleFirst.bind(this);
        this.handlePrev = this.handlePrev.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.handleLast = this.handleLast.bind(this);
    }
    getPageQueryString(number) {
        /*let params = `${(url.indexOf('?') > -1 ? '&' : '?')}page=${number}`;
        const query = this.props.location.query;
        const hasParams = Object.keys(query);

        if (hasParams.length > 0 && this.props.location.query.page) {
            params = '';
            hasParams.forEach((param, i) => {
                const joiner = i > 0 ? '&' : '?';
                params += param === 'page' ? `${joiner}${param}=${number}` : `${joiner}${param}=${this.props.location.query[param]}`;
            });
        } else if (hasParams.length > 0) {
            params = `?${hasParams[0]}=${query[hasParams[0]]}&page=${number}`;
        }*/

        const url = this.props.url;
        return `${(url.indexOf('?') > -1 ? '&' : '?')}page=${number}`;
    }
    handleFirst(e) {
        e.preventDefault();
        browserHistory.push(`/${this.props.url}`);
    }
    handlePrev(e) {
        e.preventDefault();
        const prevPage = this.props.currentPage - 1;
        const url = this.props.url;

        if (prevPage > 1) {
            const page = this.getPageQueryString(prevPage);
            browserHistory.push(`/${url}${page}`);
        } else {
            browserHistory.push(`/${url}`);
        }
    }
    handleChange(e) {
        e.preventDefault();

        const page = parseInt(e.currentTarget.innerText, 10);
        let pageUrl = '';
        if (page > 1) {
            pageUrl = this.getPageQueryString(page);
        }

        browserHistory.push(`${this.props.url}${pageUrl}`);
    }
    handleNext(e) {
        e.preventDefault();
        const page = this.getPageQueryString(this.props.currentPage + 1);
        browserHistory.push(`${this.props.url}${page}`);
    }
    handleLast(e) {
        e.preventDefault();
        const page = this.getPageQueryString(this.props.totalPages);
        browserHistory.push(`/${this.props.url}${page}`);
    }
    render() {
        //let i = 1;
        const total = this.props.totalPages;
        const current = this.props.currentPage;
        const pages = [];
        const hasName = this.props.name;

        let first;
        let prev;
        let next;
        let last;
        let totalItems;

        const console = (
            <li key='console-page'>
                <span>{`${current} de ${total}`}</span>
            </li>
        );

        if (hasName) {
            totalItems = (
                <li key='total-items'>
                    <span>{`${this.props.total} ${hasName}`}</span>
                </li>
            );
        }

        if (current > 1 && current <= total) {
            first = (
                <li key='first-page'>
                    <a
                        onClick={this.handleFirst}
                    >{'Primera'}</a>
                </li>
            );

            prev = (
                <li key='prev-page'>
                    <a
                        onClick={this.handlePrev}
                    >{'Ant.'}</a>
                </li>
            );
        }

        if (current < total) {
            next = (
                <li key='next-page'>
                    <a
                        onClick={this.handleNext}
                    >{'Sig.'}</a>
                </li>
            );

            last = (
                <li key='last-page'>
                    <a
                        onClick={this.handleLast}
                    >{'Última'}</a>
                </li>
            );
        }

        const rangeBack = current - this.props.range;
        const rangeForward = ((current + this.props.range) + 1) > total ? total + 1 : ((current + this.props.range) + 1);

        for (let p = rangeBack; p < rangeForward; p++) {
            if ((p > 0) && (p <= total)) {
                if (p === current) {
                    pages.push(
                        <li
                            key={`page-${p}`}
                            className='active'
                        >
                            <a remote='false'>{p.toString()}</a>
                        </li>
                    );
                } else {
                    pages.push(
                        <li key={`page-${p}`}>
                            <a
                                onClick={this.handleChange}
                            >
                                {p.toString()}
                            </a>
                        </li>
                    );
                }
            }
        }

        /*for (; i <= total; i++) {
            if (current === i) {
                pages.push(
                    <li
                        key={`page-${i}`}
                        className='active'
                    >
                        <a remote='false'>{i.toString()}</a>
                    </li>
                );
            } else {
                pages.push(
                    <li key={`page-${i}`}>
                        <a
                            onClick={this.handleChange}
                        >
                            {i.toString()}
                        </a>
                    </li>
                );
            }
        }*/

        return (
            <div id='pagination'>
                <ul className='pagination pagination-sm'>
                    {first}
                    {prev}
                    {pages}
                    {next}
                    {last}
                    {console}
                    {totalItems}
                </ul>
            </div>
        );
    }
}

Pagination.propTypes = {
    url: React.PropTypes.string.isRequired,
    currentPage: React.PropTypes.number.isRequired,
    totalPages: React.PropTypes.number.isRequired,
    range: React.PropTypes.number,
    total: React.PropTypes.number,
    name: React.PropTypes.string
};

Pagination.defaultProps = {
    range: 2
};
