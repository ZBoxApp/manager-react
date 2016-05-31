// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import EventEmitter from 'events';
import Constants from '../utils/constants.jsx';

const eventTypes = Constants.EventTypes;

class DomainStoreClass extends EventEmitter {
    constructor() {
        super();
        this.current = null;
        this.domains = null;
        this.distributionListOwners = null;
        this.distributionListMembers = null;
        this.zoneDNS = null;
    }

    resetThisStore() {
        this.current = null;
        this.domains = null;
        this.distributionListOwners = null;
        this.distributionListMembers = null;
        this.zoneDNS = null;
    }

    setDomains(domains) {
        if (domains) {
            this.domains = domains;
        }

        return true;
    }

    getDomains() {
        if (this.domains) {
            return this.domains;
        }

        return null;
    }

    getDomainByName(name) {
        if (this.domains) {
            const data = this.domains.domain;

            if (data) {
                let length = data.length;

                for (;length-- > 0;) {
                    if (data[length].name === name) {
                        return data[length];
                    }
                }
            }
        }

        return null;
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

        if (adminsArray) {
            adminsArray.forEach((a) => {
                admins[a.id] = a;
            });

            this.current.admins = admins;
        }
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

    getDistributionListById(listId, domain) {
        if (this.current !== domain) {
            this.setCurrent(domain);
        }

        const distributionLists = this.current.lists;

        if (!distributionLists) {
            return null;
        }

        for (const id in distributionLists) {
            if (distributionLists.hasOwnProperty(id) && id === listId) {
                return distributionLists[id];
            }
        }

        return false;
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

    getMembers() {
        if (this.distributionListMembers) {
            return this.distributionListMembers;
        }

        return null;
    }

    setMembers(members) {
        this.distributionListMembers = members;
    }

    addMember(member) {
        if (this.distributionListMembers && Array.isArray(this.distributionListMembers)) {
            this.distributionListMembers.push(member);
        }
    }

    removeMember(member) {
        if (this.distributionListMembers && Array.isArray(this.distributionListMembers)) {
            const members = this.distributionListMembers;
            const length = members.length;

            for (let i = 0; i < length; i++) {
                if (members[i] === member) {
                    members.splice(i, 1);
                    return true;
                }
            }
        }

        return false;
    }

    getOwners() {
        if (this.distributionListOwners) {
            return this.distributionListOwners;
        }

        return null;
    }

    setOwners(owners) {
        this.distributionListOwners = owners;
    }

    addOwners(owner) {
        if (this.distributionListOwners && Array.isArray(this.distributionListOwners)) {
            this.distributionListOwners.push(owner);
        }
    }

    removeOwner(owner) {
        if (this.distributionListOwners && Array.isArray(this.distributionListOwners)) {
            const owners = this.distributionListOwners;
            const length = owners.length;

            for (let i = 0; i < length; i++) {
                if (owners[i] === owner) {
                    owners.splice(i, 1);
                    return true;
                }
            }
        }

        return false;
    }

    setZoneDNS(zone) {
        this.zoneDNS = zone;
        return this.emitZoneDNSChange(zone);
    }

    getZoneDNS() {
        if (this.zoneDNS) {
            return this.zoneDNS;
        }

        return null;
    }

    removeDistributionList(listId) {
        if (this.current.lists) {
            Reflect.deleteProperty(this.current.lists, listId);
        }
        this.emitDistributionListsChange();
    }

    emitZoneDNSChange(zone) {
        this.emit(eventTypes.ZONE_DNS_CHANGE_EVENT, zone);
    }

    addZoneDNSChangeListener(zone) {
        this.on(eventTypes.ZONE_DNS_CHANGE_EVENT, zone);
    }

    removeZoneDNSChangeListener(zone) {
        this.removeListener(eventTypes.ZONE_DNS_CHANGE_EVENT, zone);
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

    emitNextStep(attrs) {
        this.emit(eventTypes.NEXT_STEP_EVENT, attrs);
    }

    addNextStepListener(callback) {
        this.on(eventTypes.NEXT_STEP_EVENT, callback);
    }

    removeNextStepListener(callback) {
        this.removeListener(eventTypes.NEXT_STEP_EVENT, callback);
    }
}

const DomainStore = new DomainStoreClass();

export {DomainStore as default};
