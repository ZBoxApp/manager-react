// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import AppDispatcher from '../dispatcher/app_dispatcher.jsx';
import Constants from '../utils/constants.jsx';
const ActionTypes = Constants.ActionTypes;

export function emitStartLoading() {
    AppDispatcher.handleViewAction({
        type: ActionTypes.START_LOADING
    });
}

export function emitEndLoading() {
    AppDispatcher.handleViewAction({
        type: ActionTypes.END_LOADING
    });
}

export function emitMessage(attrs) {
    AppDispatcher.handleViewAction({
        type: ActionTypes.NEW_MESSAGE,
        attrs
    });
}

export function saveUser(user) {
    AppDispatcher.handleViewAction({
        type: ActionTypes.USER_CHANGED,
        user
    });
}
