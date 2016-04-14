// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import jszimbra from 'js-zimbra';
import UserStore from '../stores/user_store.jsx';
import * as Utils from './utils.jsx';

// import Domain from '../zimbra/domain.jsx';

let domain;

// función que maneja el error como corresponde
function handleError(methodName, err) {
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

export function login(username, secret, success, error) {
    const config = global.window.manager_config;
    const zimbra = new jszimbra.Communication({
        url: config.zimbraUrl,
        debug: config.debug
    });

    zimbra.auth({
        username,
        secret,
        isPassword: true,
        isAdmin: true
    }, (err) => {
        if (err) {
            var e = handleError('login', err);
            return error(e);
        }

        Utils.setCookie('token', zimbra.token, 3);
        UserStore.setCurrentUser({
            token: zimbra.token,
            email: username
        });
        return success(zimbra);
    });
}

export function logout(callback) {
    // Aqui debemos asignar como null todas aquellas clases instanciadas
    domain = null;
    const cookie = Utils.getCookie('token');
    if (cookie) {
        Utils.setCookie('token', '', -1);
    }
    UserStore.setCurrentUser(null);

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

export function getDomain(name, by, attrs, success, error) {
    if (domain) {
        return domain.get(name, by, attrs,
            (data) => {
                return success(data);
            },
            (err) => {
                var e = handleError('getDomain', err);
                error(e);
            });
    }

    // probablemente esto lo que deba hacer es forzar un login
    return error({message: 'Domain not initialized'});
}
