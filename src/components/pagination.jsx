import React from 'react';
import {browserHistory} from 'react-router';

export default class Pagination extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(e) {
        e.preventDefault();

        const page = parseInt(e.currentTarget.innerText, 10);
        let pageUrl = '';
        if (page > 1) {
            pageUrl = `?page=${page}`;
        }

        browserHistory.push(`/${this.props.url}${pageUrl}`);
    }
    render() {
        const total = this.props.totalPages;
        const current = this.props.currentPage;
        const pages = [];

        // let first;
        // let prev;
        // let next;
        // let last;
        let i = 1;

        // if (current > 1 && current < total) {
        //
        // }

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
                        >{i.toString()}</a>
                    </li>
                );
            }
        }

        return (
            <div className='pagination'>
                <ul className='pagination'>
                    {pages}
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
