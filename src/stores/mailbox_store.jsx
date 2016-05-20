// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import EventEmitter from 'events';
import Constants from '../utils/constants.jsx';

const eventTypes = Constants.EventTypes;

let mailboxesArray = null;
let mailboxexInstances = [];

class MailboxStoreClass extends EventEmitter {
    constructor() {
        super();
        this.current = null;
        this.currentPage = {};
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
            console.log(this.currentPage);
            return this.currentPage[page];
        }

        return false;
    }

    setCurrent(account) {
        this.current = account;
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

    setMailboxes(mailboxes, page) {
        if (mailboxesArray) {
            Array.prototype.push.apply(mailboxexInstances, mailboxes.account);
            mailboxesArray.account = mailboxexInstances;
            console.log('mailbox', mailboxes);
            if (page) {
                this.currentPage[page] = mailboxes;
                console.log(this.currentPage[page]);
            }
            return true;
        }

        mailboxesArray = mailboxes;
        mailboxexInstances = mailboxes.account;
        if (page) {
            this.currentPage[page] = mailboxes;
            console.log(this.currentPage[page]);
        }
        return true;
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
