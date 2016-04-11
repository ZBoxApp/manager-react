// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import {browserHistory} from 'react-router';
import * as GlobalActions from '../action_creators/global_actions.jsx';
import CONSTANTS from './constants.jsx';

const COOKIE_TIMEOUT = 24 * 60 * 60 * 1000;

export function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * COOKIE_TIMEOUT));
    const expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + '; ' + expires;
}

export function getCookie(cname) {
    var name = cname + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

export function slug(str) {
    return str.toLowerCase().replace(/ /g, '_');
}

export function areObjectsEqual(x, y) {
    let p;
    const leftChain = [];
    const rightChain = [];

    // Remember that NaN === NaN returns false
    // and isNaN(undefined) returns true
    if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
        return true;
    }

    // Compare primitives and functions.
    // Check if both arguments link to the same object.
    // Especially useful on step when comparing prototypes
    if (x === y) {
        return true;
    }

    // Works in case when functions are created in constructor.
    // Comparing dates is a common scenario. Another built-ins?
    // We can even handle functions passed across iframes
    if ((typeof x === 'function' && typeof y === 'function') ||
        (x instanceof Date && y instanceof Date) ||
        (x instanceof RegExp && y instanceof RegExp) ||
        (x instanceof String && y instanceof String) ||
        (x instanceof Number && y instanceof Number)) {
        return x.toString() === y.toString();
    }

    if (x instanceof Map && y instanceof Map) {
        return areMapsEqual(x, y);
    }

    // At last checking prototypes as good a we can
    if (!(x instanceof Object && y instanceof Object)) {
        return false;
    }

    if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
        return false;
    }

    if (x.constructor !== y.constructor) {
        return false;
    }

    if (x.prototype !== y.prototype) {
        return false;
    }

    // Check for infinitive linking loops
    if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
        return false;
    }

    // Quick checking of one object beeing a subset of another.
    for (p in y) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
        } else if (typeof y[p] !== typeof x[p]) {
            return false;
        }
    }

    for (p in x) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
        } else if (typeof y[p] !== typeof x[p]) {
            return false;
        }

        switch (typeof (x[p])) {
        case 'object':
        case 'function':

            leftChain.push(x);
            rightChain.push(y);

            if (!areObjectsEqual(x[p], y[p])) {
                return false;
            }

            leftChain.pop();
            rightChain.pop();
            break;

        default:
            if (x[p] !== y[p]) {
                return false;
            }
            break;
        }
    }

    return true;
}

export function areMapsEqual(a, b) {
    if (a.size !== b.size) {
        return false;
    }

    for (let [key, value] of a) {
        if (!b.has(key)) {
            return false;
        }

        if (!areObjectsEqual(value, b.get(key))) {
            return false;
        }
    }

    return true;
}

export function handleLink(e, path, location) {
    e.preventDefault();
    if (location) {
        if (`/${location.pathname}` !== path) {
            GlobalActions.emitStartLoading();
            browserHistory.push(path);
        }
    } else {
        GlobalActions.emitStartLoading();
        browserHistory.push(path);
    }
}

export function isObjectEmpty(value) {
    for (const key in value) {
        if (value.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

export function validateInputRequired(refs) {
    return new Promise((resolve, reject) => {
        if (!refs || isObjectEmpty(refs) || Array.isArray(refs)) {
            reject({
                message: 'No se puede validar un arreglo o un objeto vacio o indefinido',
                typeError: 'warning'
            });
        }

        for (const ref in refs) {
            if (refs.hasOwnProperty(ref)) {
                if (refs[ref].hasAttribute('data-required') && refs[ref].getAttribute('data-required') === 'true' && refs[ref].value === '') {
                    let message;
                    if (refs[ref].getAttribute('data-message') && refs[ref].getAttribute('data-message').length > 0) {
                        message = refs[ref].getAttribute('data-message');
                    } else {
                        message = 'Algunos Campos son requeridos, verificar por favor.';
                    }
                    const Error = {
                        message,
                        typeError: 'warning',
                        node: refs[ref]
                    };

                    return reject(Error);
                }
            }
        }
        return resolve(null);
    });
}

export function toggleStatusButtons(classNames, isDisabled) {
    let elements = document.querySelectorAll(classNames);
    if (elements.length > 0) {
        let l = elements.length;
        for (; l-- > 0;) {
            if (isDisabled) {
                elements[l].setAttribute('disabled', 'disabled');
            } else {
                elements[l].removeAttribute('disabled');
            }
        }
    }
}

export function dateFormatted(dateString) {
    if (typeof dateString === 'string') {
        const date = dateString.substr(0, 8);
        const year = date.substr(0, 4);
        const month = parseInt(date.substr(4, 2), 10);
        const day = date.substr(6, 2);
        const dateFormattedString = `${day} de ${CONSTANTS.MONTHS[month - 1]} de ${year}`;

        return dateFormattedString;
    }

    return false;
}
