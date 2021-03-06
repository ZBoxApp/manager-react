// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See License.txt for license information.

import keyMirror from 'keymirror';

export default {
    ActionTypes: keyMirror({
        START_LOADING: null,
        END_LOADING: null,
        START_TASK_LOADING: null,
        END_TASK_LOADING: null,
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
        ACCOUNT_CHANGE_EVENT: null,
        START_LOADING_EVENT: null,
        END_LOADING_EVENT: null,
        START_TASK_LOADING_EVENT: null,
        END_TASK_LOADING_EVENT: null,
        USER_CHANGE_EVENT: null,
        NEW_MESSAGE_EVENT: null,
        NEW_TOAST_EVENT: null,
        MAILBOX_ADD_MASSIVE_EVENT: null,
        NEXT_STEP_EVENT: null,
        ZONE_DNS_CHANGE_EVENT: null,
        SEND_DOMAINID_EVENT: null
    }),

    MessageType: keyMirror({
        SUCCESS: null,
        WARNING: null,
        ERROR: null,
        INFO: null,
        LOCKED: null
    }),

    ZimbraCodes: {
        AUTH_EXPIRED: 'service.AUTH_EXPIRED',
        AUTH__REQUIRED: 'service.AUTH_REQUIRED',
        TOO_MANY_SEARCH_RESULTS: 'account.TOO_MANY_SEARCH_RESULTS'
    },

    ZimbraSearchs: {
      DOMAINS_WITHOUT_LIMITS: '{"advance_query": {"query": "(!(zimbraDomainCOSMaxAccounts=*))", "types": "domains"}}'
    },

    RESERVED_USERNAMES: [
        'admin',
        'root'
    ],
    MONTHS: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Juio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    QueryOptions: {
        DEFAULT_LIMIT: 10
    },
    Labels: keyMirror({
        name: null,
        type: null,
        content: null,
        priority: null,
        ttl: null
    }),
    typesOfDNS: [
        'AAAA',
        'AFSDB',
        'CERT',
        'CNAME',
        'A',
        'DLV',
        'DNSKEY',
        'DS',
        'EUI48',
        'EUI64',
        'HINFO',
        'IPSECKEY',
        'KEY',
        'KX',
        'LOC',
        'MINFO',
        'MR',
        'MX',
        'NAPTR',
        'NS',
        'NSEC',
        'NSEC3',
        'NSEC3PARAM',
        'OPT',
        'PTR',
        'RKEY',
        'RP',
        'RRSIG',
        'SOA',
        'SPF',
        'SRV',
        'SSHFP',
        'TLSA',
        'TSIG',
        'TXT',
        'WKS'
    ],
    MaxLengthOfPasswd: 9,
    status: {
        active: {
            label: 'Activa',
            isEnabledOnCreate: true,
            isEnabledOnEdit: true,
            classes: 'label-success mailbox-status'
        },
        locked: {
            label: 'Inactiva',
            isEnabledOnCreate: true,
            isEnabledOnEdit: true,
            classes: 'label-warning mailbox-status'
        },
        lockout: {
            label: 'Bloqueada',
            isEnabledOnCreate: false,
            isEnabledOnEdit: false,
            classes: 'label-warning mailbox-status'
        },
        closed: {
            label: 'Cerrada',
            isEnabledOnCreate: true,
            isEnabledOnEdit: true,
            classes: 'label-default mailbox-status'
        }
    }
};
