// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See License.txt for license information.

import keyMirror from 'keymirror';

export default {
    ActionTypes: keyMirror({
        START_LOADING: null,
        END_LOADING: null,
        USER_CHANGED: null,
        RECEIVED_ERROR: null,
        NEW_MESSAGE: null,
        NEW_TOAST: null
    }),

    PayloadSources: keyMirror({
        SERVER_ACTION: null,
        VIEW_ACTION: null
    }),

    EventTypes: keyMirror({
        DOMAIN_ADMINS_CHANGE_EVENT: null,
        DOMAIN_DLS_CHANGE_EVENT: null,
        START_LOADING_EVENT: null,
        END_LOADING_EVENT: null,
        USER_CHANGE_EVENT: null,
        NEW_MESSAGE_EVENT: null,
        NEW_TOAST_EVENT: null
    }),

    MessageType: keyMirror({
        SUCCESS: null,
        WARNING: null,
        ERROR: null,
        INFO: null
    }),

    ZimbraCodes: {
        AUTH_EXPIRED: 'service.AUTH_EXPIRED',
        AUTH__REQUIRED: 'service.AUTH_REQUIRED'
    },

    RESERVED_USERNAMES: [
        'admin',
        'root'
    ],
    MONTHS: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Juio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    QueryOptions: {
        DEFAULT_LIMIT: 10
    }
};
