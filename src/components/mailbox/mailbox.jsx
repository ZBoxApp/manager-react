// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import {browserHistory} from 'react-router';
import PageInfo from '../page_info.jsx';
import Panel from '../panel.jsx';
import * as Client from '../../utils/client.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';

export default class Accounts extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null
        };

        this.handleLink = this.handleLink.bind(this);
        this.getMailboxes = this.getMailboxes.bind(this);
    }

    getMailboxes() {
        Client.getAllDomains(
            (data) => {
                this.setState({
                    data
                });
                GlobalActions.emitEndLoading();
            },
            (error) => {
                this.setState({
                    error: error.message
                });
                GlobalActions.emitEndLoading();
            }
        );
    }

    componentDidMount() {
        $('#sidebar-accounts').addClass('active');
        GlobalActions.emitEndLoading();
    }

    componentWillUnmount() {
        $('#sidebar-accounts').removeClass('active');
    }

    handleLink(e, path) {
        e.preventDefault();

        browserHistory.push(path);
    }

    render() {
        const addMailBoxButton = [{
            label: '+ Agregar Casilla',
            props: {
                className: 'btn btn-success',
                onClick: (e) => {
                    this.handleLink(e, '/mailboxes/new');
                }
            }
        }];

        const panelBody = (
            <div className='center-block text-center'>
                <h5>{'Sin resultados para su busqueda.'}</h5>
            </div>
        );

        const pageInfo = (
            <PageInfo
                titlePage='Casillas'
                descriptionPage='Las casillas ...'
            />
        );

        const hasPageInfo = (this.props.children) ? '' : pageInfo;

        const indexView = (
            <Panel
                btnsHeader={addMailBoxButton}
                children={panelBody}
            />
        );

        const views = this.props.children || indexView;

        return (
            <div>

                {hasPageInfo}

                <div className='content animate-panel'>
                    <div className='row'>
                        <div className='col-md-12 central-content'>
                            {views}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Accounts.propTypes = {
    children: React.PropTypes.any
};
