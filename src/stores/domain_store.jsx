// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import EventEmitter from 'events';
import Constants from '../utils/constants.jsx';

const eventTypes = Constants.EventTypes;

class DomainStoreClass extends EventEmitter {
    constructor() {
        super();
        this.current = null;
    }

    getCurrent() {
        return this.current;
    }

    setCurrent(domain) {
        this.current = domain;
    }

    getCurrentId() {
        const domain = this.getCurrent();

        if (domain) {
            return domain.id;
        }

        return null;
    }

    getAdminsAsObject(domain) {
        if (this.current !== domain) {
            this.setCurrent(domain);
        }

        const domainAdmins = this.current.admins;

        if (!domainAdmins) {
            return null;
        }

        return domainAdmins;
    }

    getAdmins(domain) {
        if (this.current !== domain) {
            this.setCurrent(domain);
        }

        const admins = [];
        const domainAdmins = this.current.admins;

        if (!domainAdmins) {
            return null;
        }

        for (const id in domainAdmins) {
            if (domainAdmins.hasOwnProperty(id)) {
                admins.push(domainAdmins[id]);
            }
        }

        return admins;
    }

    setAdmins(domain, adminsArray) {
        if (this.current !== domain) {
            this.setCurrent(domain);
        }

        const admins = {};

        adminsArray.forEach((a) => {
            admins[a.id] = a;
        });

        this.current.admins = admins;
    }

    addAdmin(user) {
        const admins = this.current.admins || {};
        admins[user.id] = user;
        this.current.admins = admins;

        this.emitAdminsChange();
    }

    removeAdmin(userId) {
        if (this.current.admins) {
            Reflect.deleteProperty(this.current.admins, userId);
        }
        this.emitAdminsChange();
    }

    emitAdminsChange() {
        this.emit(eventTypes.DOMAIN_ADMINS_CHANGE_EVENT);
    }

    addAdminsChangeListener(callback) {
        this.on(eventTypes.DOMAIN_ADMINS_CHANGE_EVENT, callback);
    }

    removeAdminsChangeListener(callback) {
        this.removeListener(eventTypes.DOMAIN_ADMINS_CHANGE_EVENT, callback);
    }

    getDistributionLists(domain) {
        if (this.current !== domain) {
            this.setCurrent(domain);
        }

        const lists = [];
        const distributionLists = this.current.lists;

        if (!distributionLists) {
            return null;
        }

        for (const id in distributionLists) {
            if (distributionLists.hasOwnProperty(id)) {
                lists.push(distributionLists[id]);
            }
        }

        return lists;
    }

    setDistibutionLists(domain, listsArray) {
        if (this.current !== domain) {
            this.setCurrent(domain);
        }

        const lists = {};

        listsArray.forEach((a) => {
            lists[a.id] = a;
        });

        this.current.lists = lists;
    }

    addDistributionList(list) {
        const lists = this.current.lists || {};
        lists[list.id] = list;
        this.current.lists = lists;

        this.emitDistributionListsChange();
    }

    removeDistributionList(listId) {
        if (this.current.lists) {
            Reflect.deleteProperty(this.current.lists, listId);
        }
        this.emitDistributionListsChange();
    }

    emitDistributionListsChange() {
        this.emit(eventTypes.DOMAIN_DLS_CHANGE_EVENT);
    }

    addDistributionListsChangeListener(callback) {
        this.on(eventTypes.DOMAIN_DLS_CHANGE_EVENT, callback);
    }

    removeDistributionListsChangeListener(callback) {
        this.removeListener(eventTypes.DOMAIN_DLS_CHANGE_EVENT, callback);
    }
}

const DomainStore = new DomainStoreClass();

export {DomainStore as default};
