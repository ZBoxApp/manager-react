import AppDispatcher from '../dispatcher/app_dispatcher.jsx';
import { showAlert } from '../action_creators/global_actions.jsx';
import Constants from '../utils/constants.jsx';
import { getAccountById } from '../utils/client.jsx';
import EventEmitter from 'events';

const EventTypes = Constants.EventTypes;

export class WatchDeleteAccountProcess extends EventEmitter {
    static defaultTimeoutWatcher = 10000;
    constructor() {
        super();
        this.ids = [];
    }

    watchPromise(id, resolve, reject, promise, timeout = WatchDeleteAccountProcess.defaultTimeoutWatcher) {
        return promise(id).then(() => {
            setTimeout(() => {
                this.watchPromise(id, resolve, reject, promise, timeout);
            }, timeout);
        }).catch(resolve);
    }

    watchAccount(id, timeout) {
        return new Promise((resolve, reject) => {
            this.watchPromise(id, resolve, reject, getAccountById, timeout);
        });
    }

    startDeletingAccount(account) {
        this.registerId(account);
        const { id } = account;
        this.watchAccount(id).then(({ code }) => {
            if (code === 'account.NO_SUCH_ACCOUNT') {
                // notify that account was deleted, to then show alert notifier
                this.emit(EventTypes.ACCOUNT_REMOVED, id);
            }
        }).catch((_) => _);
    }

    accountDeleted(id) {
        this.unregisterId(id);
    }

    startDeleteAccountProcess(id) {
        this.emit(EventTypes.WATCHING_DELETE_ACCOUNT, id);
    }

    addListenerDeletingAccount() {
        this.on(EventTypes.WATCHING_DELETE_ACCOUNT, this.startDeletingAccount);
    }

    addListenerOnDeletedAccount() {
        this.on(EventTypes.ACCOUNT_REMOVED, this.emitNotifyAccountDeleted);
    }

    removeListenerDeletingAccount() {
        this.removeListener(EventTypes.WATCHING_DELETE_ACCOUNT, this._restartAttributes);
    }

    removeListenerOnDeletedAccount() {
        this.removeListener(EventTypes.ACCOUNT_REMOVED);
    }

    _restartAttributes() {
        this.ids = [];
    }

    _getAccountById(id) {
        return this.ids.find((account) => account.id === id);
    }

    emitNotifyAccountDeleted(id) {
        const currentAccount = this._getAccountById(id);
        this.unregisterId(id);
        const timeOut = 7000;
        const timeOutExtended = 2000;
        let msg = 'Se ha borrado la cuenta con exito';

        if (currentAccount) {
            msg = `Se ha borrado la cuenta ${currentAccount.name} con exito`;
        }

        showAlert({
            type: 'success',
            title: 'Cuenta borrada!',
            body: msg,
            options: {
                timeOut,
                extendedTimeOut: timeOutExtended,
                closeButton: true
            }
        });
    }

    registerId(account) {
        const idExist = this.ids.some((_account) => _account.id === account.id);
        if (idExist === false) {
            this.ids.push(account);
        }
    }

    unregisterId(id) {
        const nextIds = this.ids.filter((account) => account.id !== id);
        this.ids = nextIds;
    }
}

var WatchDeletingAccount = new WatchDeleteAccountProcess();
WatchDeletingAccount.setMaxListeners(0);

WatchDeletingAccount.dispatchToken = AppDispatcher.register((payload) => {
    var action = payload.action;

    switch (action.type) {
    case EventTypes.WATCHING_DELETE_ACCOUNT:
        WatchDeletingAccount.startDeletingAccount(action.account);
        break;
    default:
    }
});

export default WatchDeletingAccount;
