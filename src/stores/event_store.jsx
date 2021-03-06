// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import AppDispatcher from '../dispatcher/app_dispatcher.jsx';
import EventEmitter from 'events';
import Constants from '../utils/constants.jsx';

const eventTypes = Constants.EventTypes;
const ActionTypes = Constants.ActionTypes;

class EventStoreClass extends EventEmitter {
    emitStartLoading() {
        this.emit(eventTypes.START_LOADING_EVENT);
    }

    addStartLoadingListener(callback) {
        this.on(eventTypes.START_LOADING_EVENT, callback);
    }

    removeStartLoadingListener(callback) {
        this.removeListener(eventTypes.START_LOADING_EVENT, callback);
    }

    emitEndLoading() {
        this.emit(eventTypes.END_LOADING_EVENT);
    }

    addEndLoadingListener(callback) {
        this.on(eventTypes.END_LOADING_EVENT, callback);
    }

    removeEndLoadingListener(callback) {
        this.removeListener(eventTypes.END_LOADING_EVENT, callback);
    }

    emitMessage(attrs) {
        this.emit(eventTypes.NEW_MESSAGE_EVENT, attrs);
    }

    addMessageListener(callback) {
        this.on(eventTypes.NEW_MESSAGE_EVENT, callback);
    }

    removeMessageListener(callback) {
        this.removeListener(eventTypes.NEW_MESSAGE_EVENT, callback);
    }

    emitToast(message) {
        this.emit(eventTypes.NEW_TOAST_EVENT, message);
    }

    addToastListener(callback) {
        this.on(eventTypes.NEW_TOAST_EVENT, callback);
    }

    removeToastListener(callback) {
        this.removeListener(eventTypes.NEW_TOAST_EVENT, callback);
    }

    emitTask(params) {
        this.emit(eventTypes.START_TASK_LOADING_EVENT, params);
    }

    emitEndTask(params) {
        this.emit(eventTypes.END_TASK_LOADING_EVENT, params);
    }

    addEndTaskSListener(params) {
        this.on(eventTypes.END_TASK_LOADING_EVENT, params);
    }

    addTaskSListener(callback) {
        this.on(eventTypes.START_TASK_LOADING_EVENT, callback);
    }

    removeTaskSListener(callback) {
        this.removeListener(eventTypes.START_TASK_LOADING_EVENT, callback);
    }

    removeEndTaskSListener(params) {
        this.removeListener(eventTypes.END_TASK_LOADING_EVENT, params);
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
    case ActionTypes.NEW_MESSAGE:
        EventStore.emitMessage(action.attrs);
        break;
    case ActionTypes.NEW_TOAST:
        EventStore.emitToast(action.message);
        break;
    case ActionTypes.START_TASK_LOADING:
        EventStore.emitTask(action.params);
        break;
    case ActionTypes.END_TASK_LOADING:
        EventStore.emitEndTask(action.params);
        break;
    default:
    }
});

export default EventStore;
