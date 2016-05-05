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

        browserHistory.push(`/${this.props.url}${pageUrl}`);
    }
    handleNext(e) {
        e.preventDefault();
        const page = this.getPageQueryString(this.props.currentPage + 1);
        browserHistory.push(`/${this.props.url}${page}`);
    }
    handleLast(e) {
        e.preventDefault();
        const page = this.getPageQueryString(this.props.totalPages);
        browserHistory.push(`/${this.props.url}${page}`);
    }
    render() {
        const total = this.props.totalPages;
        const current = this.props.currentPage;
        const pages = [];

        let first;
        let prev;
        let next;
        let last;
        let i = 1;

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

        for (; i <= total; i++) {
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
        }

        return (
            <div id='pagination'>
                <ul className='pagination pagination-sm'>
                    {first}
                    {prev}
                    {pages}
                    {next}
                    {last}
                </ul>
            </div>
        );
    }
}

Pagination.propTypes = {
    url: React.PropTypes.string.isRequired,
    currentPage: React.PropTypes.number.isRequired,
    totalPages: React.PropTypes.number.isRequired
};
