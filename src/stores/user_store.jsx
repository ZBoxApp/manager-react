// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import AppDispatcher from '../dispatcher/app_dispatcher.jsx';
import EventEmitter from 'events';
import Constants from '../utils/constants.jsx';

const ActionTypes = Constants.ActionTypes;
const eventTypes = Constants.EventTypes;

class UserStoreClass extends EventEmitter {
    constructor() {
        super();
        this.currentUser = null;
    }

    resetThisStore() {
        this.currentUser = null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    setCurrentUser(user) {
        this.currentUser = user;
    }

    getCurrentId() {
        const user = this.getCurrentUser();

        if (user) {
            return user.id;
        }

        return null;
    }

    isGlobalAdmin() {
        const user = this.getCurrentUser();

        if (user) {
            return user.attrs._attrs.zimbraIsAdminAccount === 'TRUE'; //eslint-disable-line no-underscore-dangle
        }

        return false;
    }

    emitChange() {
        this.emit(eventTypes.USER_CHANGE_EVENT);
    }

    addChangeListener(callback) {
        this.on(eventTypes.USER_CHANGE_EVENT, callback);
    }

    removeChangeListener(callback) {
        this.removeListener(eventTypes.USER_CHANGE_EVENT, callback);
    }
}

const UserStore = new UserStoreClass();
UserStore.setMaxListeners(0);

UserStore.dispatchToken = AppDispatcher.register((payload) => {
    var action = payload.action;

    switch (action.type) {
    case ActionTypes.USER_CHANGED:
        UserStore.setCurrentUser(action.user);
        UserStore.emitChange();
        break;
    default:
    }
});

export {UserStore as default};
