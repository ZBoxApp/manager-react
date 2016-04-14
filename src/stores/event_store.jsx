// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import AppDispatcher from '../dispatcher/app_dispatcher.jsx';
import EventEmitter from 'events';
import Constants from '../utils/constants.jsx';
const ActionTypes = Constants.ActionTypes;

const START_LOADING_EVENT = 'start_loading';
const END_LOADING_EVENT = 'end_loading';

class EventStoreClass extends EventEmitter {
    emitStartLoading() {
        this.emit(START_LOADING_EVENT);
    }

    addStartLoadingListener(callback) {
        this.on(START_LOADING_EVENT, callback);
    }

    removeStartLoadingListener(callback) {
        this.removeListener(START_LOADING_EVENT, callback);
    }

    emitEndLoading() {
        this.emit(END_LOADING_EVENT);
    }

    addEndLoadingListener(callback) {
        this.on(END_LOADING_EVENT, callback);
    }

    removeEndLoadingListener(callback) {
        this.removeListener(END_LOADING_EVENT, callback);
    }
}

var EventStore = new EventStoreClass();
EventStore.setMaxListeners(0);

EventStore.dispatchToken = AppDispatcher.register((payload) => {
    var action = payload.action;

    switch (action.type) {
    case ActionTypes.START_LOADING:
        EventStore.emitStartLoading();
        break;
    case ActionTypes.END_LOADING:
        EventStore.emitEndLoading();
        break;
    default:
    }
});

export default EventStore;
