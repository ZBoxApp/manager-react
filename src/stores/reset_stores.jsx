// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import CompanyStore from './company_store.jsx';
import DomainStore from './domain_store.jsx';
import MailboxStore from './mailbox_store.jsx';
import TabStateStore from './tab_state_store.jsx';
import UserStore from './user_store.jsx';
import ZimbraStore from './zimbra_store.jsx';

class ResetStoresClass {
    constructor() {
        this.zimbra = null;
        this.cos = null;
    }

    resetAllStores() {
        CompanyStore.resetThisStore();
        DomainStore.resetThisStore();
        MailboxStore.resetThisStore();
        TabStateStore.resetThisStore();
        UserStore.resetThisStore();
        ZimbraStore.resetThisStore();
    }
}

var ResetStores = new ResetStoresClass();

export {ResetStores as default};
