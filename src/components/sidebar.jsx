// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import UserStore from '../stores/user_store.jsx';
import SidebarMenu from './sidebar_menu.jsx';

import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';

export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);

        this.onUserChanged = this.onUserChanged.bind(this);

        this.state = {
            user: UserStore.getCurrentUser()
        };
    }
    componentDidMount() {
        UserStore.addChangeListener(this.onUserChanged);
    }
    componentWillUnmount() {
        UserStore.removeChangeListener(this.onUserChanged);
    }
    onUserChanged() {
        this.setState({user: UserStore.getCurrentUser()});
    }
    render() {
        if (this.state.user) {
            const userName = this.state.user.name;
            return (
                <aside id='menu'>
                    <div id='navigation'>
                        <div className='profile-picture'>
                            <div className='stats-label text-color format-text'>
                                <span
                                    className='font-extra-bold font-uppercase'
                                    title={userName}
                                >
                                    <Link
                                        to={`/mailboxes/${this.state.user.id}`}
                                    >
                                        {userName}
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
    location: PropTypes.object.isRequired
};
