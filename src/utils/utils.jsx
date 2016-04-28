// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import {browserHistory} from 'react-router';
import * as GlobalActions from '../action_creators/global_actions.jsx';
import CONSTANTS from './constants.jsx';

export function setCookie(cname, cvalue) {
    localStorage.setItem(cname, cvalue);
}

export function getCookie(cname) {
    return localStorage.getItem(cname);
}

export function removeCookie(cname) {
    return localStorage.removeItem(cname);
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

export function dateFormatted(dateString, isShortDate, separator) {
    if (typeof dateString === 'string') {
        const date = dateString.substr(0, 8);
        const year = date.substr(0, 4);
        const month = (isShortDate) ? date.substr(4, 2) : parseInt(date.substr(4, 2), 10);
        const day = date.substr(6, 2);
        let dateFormattedString = `${day} de ${CONSTANTS.MONTHS[month - 1]} de ${year}`;

        if (isShortDate) {
            dateFormattedString = `${day}${separator}${month}${separator}${year}`;
        }

        return dateFormattedString;
    }

    return false;
}

export function removeIndexFromArray(array, index, pos) {
    array.splice(index, pos || 1);

    return array;
}

export function exportAsCSV(data, title, hasLabel) {
    const info = (typeof data === 'object') ? data : JSON.parse(data);

    let CSV = '';

    CSV += title + '\r\n\n';

    if (hasLabel) {
        let row = '';

        for (const index in info[0]) {
            if (info[0].hasOwnProperty(index)) {
                row += index + ',';
            }
        }

        row = row.slice(0, row.length - 1);

        CSV += row + '\r\n';
    }

    for (var i = 0; i < info.length; i++) {
        let row = '';

        for (var index in info[i]) {
            if (info[i].hasOwnProperty(index)) {
                row += '\'' + info[i][index] + '\',';
            }
        }

        row = row.slice(0, -1);

        CSV += row + '\r\n';
    }

    if (CSV === '') {
        return;
    }

    const fileName = title.replace(/ /g, '_') + new Date().getTime();

    const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(CSV);

    if (isSafari()) {
        const time = 500;
        var close = window.open('data:attachment/csv;charset=utf-8,' + encodeURIComponent(CSV), '_blank', 'width=1,height=1');
        setTimeout(() => {
            close.close();
        }, time);

        return;
    }

    const link = document.createElement('a');
    link.href = uri;

    link.style = 'visibility:hidden';
    link.download = fileName + '.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function isChrome() {
    if (navigator.userAgent.indexOf('Chrome') > -1) {
        return true;
    }
    return false;
}

export function isSafari() {
    if (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
        return true;
    }
    return false;
}

export function isIosChrome() {
    // https://developer.chrome.com/multidevice/user-agent
    return navigator.userAgent.indexOf('CriOS') !== -1;
}

export function isFirefox() {
    return navigator && navigator.userAgent && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
}

export function isIE() {
    if (window.navigator && window.navigator.userAgent) {
        var ua = window.navigator.userAgent;

        return ua.indexOf('Trident/7.0') > 0 || ua.indexOf('Trident/6.0') > 0;
    }

    return false;
}

export function isEdge() {
    return window.navigator && navigator.userAgent && navigator.userAgent.toLowerCase().indexOf('edge') > -1;
}

export function addOrRemoveAlias(account, params) {
    let promises = [];

    for (const label in params) {
        if (params.hasOwnProperty(label)) {
            if (label === 'add') {
                const length = params[label].length;
                for (let i = 0; i < length; i++) {
                    let mypromise = new Promise((resolve) => {
                        account.addAccountAlias(params[label][i], (response) => {
                            if (response) {
                                resolve({
                                    resolved: false,
                                    err: response,
                                    item: params[label][i],
                                    action: 'add'
                                });
                            } else {
                                resolve({
                                    resolved: true,
                                    action: 'add'
                                });
                            }
                        });
                    });

                    promises.push(mypromise);
                }
            }

            if (label === 'remove') {
                const length = params[label].length;
                for (let i = 0; i < length; i++) {
                    let mypromise = new Promise((resolve) => {
                        account.removeAccountAlias(params[label][i], (response) => {
                            if (response) {
                                resolve({
                                    resolved: false,
                                    err: response,
                                    item: params[label][i],
                                    action: 'remove'
                                });
                            } else {
                                resolve({
                                    resolved: true,
                                    action: 'remove'
                                });
                            }
                        });
                    });

                    promises.push(mypromise);
                }
            }
        }
    }

    return Promise.all(promises);
}

export function bytesToMegas(bytes) {
    if (bytes) {
        return ((bytes / 1024) / 1024).toFixed(2) + ' MB';
    }

    return 0 + 'Bytes';
}
