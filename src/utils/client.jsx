// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import {browserHistory} from 'react-router';

import ZimbraAdminApi from 'zimbra-admin-api-js';
import ZimbraStore from '../stores/zimbra_store.jsx';

import * as GlobalActions from '../action_creators/global_actions.jsx';
import * as Utils from './utils.jsx';
import Constants from './constants.jsx';

// arguments.callee.name

// función que maneja el error como corresponde
function handleError(methodName, err) {
    if (err.type && err.type === Constants.ActionTypes.NOT_LOGGED_IN) {
        browserHistory.push('/login');
        return err;
    }

    let e = null;
    try {
        e = JSON.parse(err.responseText);
    } catch (parseError) {
        e = null;
    }

    console.error(methodName, e); //eslint-disable-line no-console

    const error = {};
    if (e) {
        error.message = e.Body.Fault.Reason.Text;
    } else {
        error.message = 'Ocurrio un error general';
    }

    // Aqui deberiamos revisar si falta hacer login nuevamente

    return error;
}

function initZimbra() {
    return new Promise(
        (resolve, reject) => {
            const config = global.window.manager_config;
            const token = Utils.getCookie('token');
            let zimbra = ZimbraStore.getCurrent();

            if (zimbra && token) {
                return resolve(zimbra);
            } else if (token) {
                zimbra = new ZimbraAdminApi({
                    url: config.zimbraUrl
                });
                zimbra.client.token = token;
                ZimbraStore.setCurrent(zimbra);
                return resolve(zimbra);
            }

            return reject({
                type: Constants.ActionTypes.NOT_LOGGED_IN,
                message: 'No instanciado'
            });
        });
}

export function getClientConfig(success, error) {
    return $.ajax({
        url: '/config/config.json',
        dataType: 'json',
        success,
        error: function onError(xhr, status, err) {
            var e = handleError('getClientConfig', err);
            error(e);
        }
    });
}

export function getMe(success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.getInfo((err, data) => {
                if (err) {
                    let e = handleError('getMe', err);
                    return error(e);
                }

                Reflect.deleteProperty(data, 'obj');
                GlobalActions.saveUser(data);
                return success();
            });
        },
        (err) => {
            let e = handleError('getMe', err);
            return error(e);
        }
    );
}

export function login(user, password, success, error) {
    const config = global.window.manager_config;
    const zimbra = new ZimbraAdminApi({
        url: config.zimbraUrl,
        user,
        password
    });

    zimbra.client.debug = config.debug;

    zimbra.login((err) => {
        if (err) {
            var e = handleError('login', err);
            return error(e);
        }

        Utils.setCookie('token', zimbra.client.token, 3);
        ZimbraStore.setCurrent(zimbra);
        return getMe(success, error);
    });
}

export function logout(callback) {
    const cookie = Utils.getCookie('token');
    if (cookie) {
        Utils.setCookie('token', '', -1);
    }
    GlobalActions.saveUser(null);

    return callback();
}

export function isLoggedIn(callback) {
    const cookie = Utils.getCookie('token');
    const data = {
        logged_in: false,
        token: null
    };

    if (cookie) {
        data.logged_in = true;
        data.token = cookie;
    }

    return callback(data);
}

export function getAllDomains(success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.getAllDomains((err, data) => {
                if (err) {
                    let e = handleError('getAllDomains', err);
                    return error(e);
                }

                return success(data);
            });
        },
        (err) => {
            let e = handleError('getAllDomains', err);
            return error(e);
        }
    );
}
