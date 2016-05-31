// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import EventEmitter from 'events';
import Constants from '../utils/constants.jsx';

const eventTypes = Constants.EventTypes;

let mailboxesArray = null;

class MailboxStoreClass extends EventEmitter {
    constructor() {
        super();
        this.current = null;
        this.mailboxesByDomain = {};
    }

    resetThisStore() {
        this.current = null;
        this.mailboxesByDomain = null;
        mailboxesArray = null;
    }

    setMailboxesByDomain(id, mailboxes) {
        if (mailboxes) {
            this.mailboxesByDomain[id] = mailboxes;
            //console.log('setMailboxesByDomain', this.mailboxesByDomain);
            return true;
        }

        return false;
    }

    getMailboxByDomainId(id) {
        if (id) {
            if (this.mailboxesByDomain) {
                return this.mailboxesByDomain[id];
            }
        }

        return false;
    }

    getMailboxById(id) {
        if (mailboxesArray) {
            const accounts = mailboxesArray.account;
            const size = accounts.length;

            for (let i = 0; i < size; i++) {
                if (id === accounts[i].id) {
                    return accounts[i];
                }
            }
        }

        return false;
    }

    setMailbox(mailbox) {
        if (mailboxesArray) {
            const currentTotal = mailboxesArray.account.push(mailbox);
            if (currentTotal > mailboxesArray.total) {
                mailboxesArray.total = currentTotal;
            }
        }
    }

    hasThisPage(page) {
        if (page && this.currentPage[page]) {
            return this.currentPage[page];
        }

        return false;
    }

    setCurrentPage(page) {
        this.currentPage[page] = true;
    }

    getMailboxByPage(page) {
        if (page && this.currentPage[page]) {
            return this.currentPage[page];
        }

        return false;
    }

    setCurrent(account) {
        if (account) {
            this.current = account;
            //console.log('setCurrent', this.current);
            return true;
        }
        return false;
    }

    updateMailbox(mailboxId, newMailbox, domainId) {
        if (mailboxesArray) {
            const accounts = mailboxesArray.account;
            const index = accounts.findIndex((mailbox) => {
                return mailbox.id === mailboxId;
            });

            if (index > -1) {
                accounts[index] = newMailbox;
            }
        }

        if (domainId && this.mailboxesByDomain[domainId]) {
            const accountsFromDomain = this.mailboxesByDomain.account;
            const indexOfMailbox = accountsFromDomain.findIndex((mailbox) => {
                return mailbox.id === mailboxId;
            });

            if (indexOfMailbox > -1) {
                accountsFromDomain[indexOfMailbox] = newMailbox;
            }
        }

        return true;
    }

    getCurrent() {
        return this.current;
    }

    hasMailboxes() {
        if (mailboxesArray) {
            return true;
        }

        return false;
    }

    getPages() {
        return this.currentPage;
    }

    getMailboxes() {
        return mailboxesArray;
    }

    getMailboxByIdInDomain() {
        return false;
    }

    setMailboxes(mailboxes) {
        if (mailboxes) {
            mailboxesArray = mailboxes;
            //console.log('setMailboxes', mailboxesArray);
            return true;
        }

        return false;
    }

    changeAccount(newAccount) {
        if (mailboxesArray) {
            const accounts = mailboxesArray.account;
            const size = accounts.length;
            const id = newAccount.id;

            for (let i = 0; i < size; i++) {
                if (id === accounts[i].id) {
                    accounts[i] = newAccount;
                    return accounts[i];
                }
            }
        }

        return false;
    }

    removeAccount(account) {
        if (mailboxesArray) {
            const accounts = mailboxesArray.account;
            const size = accounts.length;
            const id = account.id;

            for (let i = 0; i < size; i++) {
                if (id === accounts[i].id) {
                    accounts.splice(i, 1);
                    if (mailboxesArray.total > 0) {
                        mailboxesArray.total = mailboxesArray.total - 1;
                    }

                    this.setMailboxes(mailboxesArray);
                    return true;
                }
            }
        }

        return false;
    }

    getAlias() {
        let zimbraAlias;
        if (this.current) {
            if (this.current.attrs.zimbraMailAlias) {
                if (!Array.isArray(this.current.attrs.zimbraMailAlias)) {
                    this.current.attrs.zimbraMailAlias = [this.current.attrs.zimbraMailAlias];
                }
                zimbraAlias = this.current.attrs.zimbraMailAlias;
            } else {
                this.current.attrs.zimbraMailAlias = [];
                zimbraAlias = this.current.attrs.zimbraMailAlias;
            }
            return zimbraAlias;
        }

        return false;
    }

    setAlias(item) {
        if (this.current) {
            const alias = this.getAlias();
            if (alias) {
                alias.push(item);
            }
        }
    }

    removeAlias(alias) {
        if (this.current) {
            const aliasArray = this.getAlias();
            if (aliasArray) {
                const limit = aliasArray.length;
                for (let i = 0; i < limit; i++) {
                    if (alias === aliasArray[i]) {
                        aliasArray.splice(i, 1);
                        return true;
                    }
                }
            }
        }

        return false;
    }

    refreshAlias(array) {
        if (this.current) {
            const alias = this.getAlias();
            if (alias) {
                Array.prototype.push.apply(alias, array);
            }
            return true;
        }

        return false;
    }

    // Declare here all events that fired when something happens

    emitAddMassive() {
        this.emit(eventTypes.MAILBOX_ADD_MASSIVE_EVENT);
    }

    addListenerAddMassive(callback) {
        this.on(eventTypes.MAILBOX_ADD_MASSIVE_EVENT, callback);
    }

    removeListenerAddMassive(callback) {
        this.removeListener(eventTypes.MAILBOX_ADD_MASSIVE_EVENT, callback);
    }

}

const MailboxStore = new MailboxStoreClass();

export {MailboxStore as default};
