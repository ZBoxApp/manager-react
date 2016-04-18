// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See License.txt for license information.

import keyMirror from 'keymirror';

export default {
    ActionTypes: keyMirror({
        START_LOADING: null,
        END_LOADING: null,
        USER_CHANGED: null,
        RECEIVED_ERROR: null
    }),

    PayloadSources: keyMirror({
        SERVER_ACTION: null,
        VIEW_ACTION: null
    }),

    ZimbraCodes: {
        NOT_LOGGED_IN: 'service.AUTH_EXPIRED'
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
