// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import UserStore from '../stores/user_store.jsx';
import SidebarMenu from './sidebar_menu.jsx';

import React from 'react';
import {Link} from 'react-router';

export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.getStateFromStores();
    }
    getStateFromStores() {
        const user = UserStore.getCurrentUser();

        // if user is null then get the user from Zimbra using the token

        return {
            user
        };
    }
    render() {
        if (this.state.user) {
            return (
                <aside id='menu'>
                    <div id='navigation'>
                        <div className='profile-picture'>
                            <div className='stats-label text-color'>
                                <span className='font-extra-bold font-uppercase'>
                                    <Link
                                        to={`/mailboxes/${this.state.user.id}`}
                                    >
                                        {this.state.user.email}
                                    </Link>
                                    <small className='text-muted'></small>
                                </span>
                            </div>
                        </div>
                        <SidebarMenu location={this.props.location}/>
                    </div>
                </aside>
            );
        }

        return <div/>;
    }
}

Sidebar.propTypes = {
    location: React.PropTypes.object.isRequired
};
