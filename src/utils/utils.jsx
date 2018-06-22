// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import {browserHistory} from 'react-router';
import * as GlobalActions from '../action_creators/global_actions.jsx';
import Constants from './constants.jsx';
import ZimbraStore from '../stores/zimbra_store.jsx';
import sweetAlert from 'sweetalert';
import moment from 'moment';

const messageType = Constants.MessageType;

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
    if (e) {
        e.preventDefault();
    }

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
                        typeError: messageType.ERROR,
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
        let dateFormattedString = `${day} de ${Constants.MONTHS[month - 1]} de ${year}`;

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

export function getPlansFromDomains(domains) {
    const configPlans = global.window.manager_config.plans;
    const plans = {};

    for (const key in configPlans) {
        if (configPlans.hasOwnProperty(key) && configPlans[key]) {
            plans[key] = {
                used: 0,
                limit: 0
            };
        }
    }

    domains.forEach((d) => {
        const pls = d.plans;
        for (const key in pls) {
            if (pls.hasOwnProperty(key) && plans.hasOwnProperty(key)) {
                plans[key].used += pls[key].used;
                plans[key].limit += (pls[key].limit || 0);
            }
        }
    });

    return plans;
}

export function getPlansFromDomain(domain) {
    const configPlans = global.window.manager_config.plans;
    const plans = {};

    for (const key in configPlans) {
        if (configPlans.hasOwnProperty(key) && configPlans[key]) {
            plans[key] = {
                used: 0,
                limit: 0
            };
        }
    }

    const pls = domain.plans;
    for (const key in pls) {
        if (pls.hasOwnProperty(key) && plans.hasOwnProperty(key)) {
            plans[key].used += pls[key].used;
            plans[key].limit += (pls[key].limit || 0);
        }
    }

    return plans;
}

export function titleCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getEnabledPlansByCos(cosArray) {
    const configPlans = global.window.manager_config.plans;
    const plans = {};

    cosArray.forEach((cos) => {
        const key = cos.name;
        if (configPlans.hasOwnProperty(key) && configPlans[key] && configPlans[key].isEnabledToEdit) {
            plans[key] = cos.id;
        }
    });

    return plans;
}

export function getEnabledPlansByCosId(cosArray) {
    const configPlans = global.window.manager_config.plans;
    const plans = {};

    cosArray.forEach((cos) => {
        const key = cos.name;
        if (configPlans.hasOwnProperty(key) && configPlans[key]) {
            plans[cos.id] = key;
        }
    });

    return plans;
}

export function getMembers(members, label) {
    let tag = label;
    if (Array.isArray(members)) {
        if (members.length === 1) {
            tag = tag.slice(0, -1);
        }
        return members.length + ' ' + tag;
    }

    throw new Error('El tipo de members no es un arreglo : ' + typeof members);
}

export function bytesToMegas(bytes) {
    let size = '0 MB';
    if (bytes && typeof bytes === 'number') {
        size = bytes;
        const mb = 1024;
        size = ((size / mb) / mb).toFixed(2) + 'MB';
    }

    return size;
}

export function getDomainFromString(string, otherwise) {
    let domain = otherwise || 'Dominio Invalido';
    if (typeof string === 'string' && string.lastIndexOf('@') > -1) {
        domain = string.split('@');
        domain = domain.pop();
    }

    return domain;
}

export function exportAsCSV(data, target, title, hasLabel) {
    let info = (typeof data === 'object') ? data : JSON.parse(data);
    const cos = getEnabledPlansByCosId(ZimbraStore.getAllCos());
    const headers = window.manager_config.export[target];
    const keys = Object.keys(headers);
    const colNames = Object.values(headers);
    const status = {
        active: 'Activa',
        closed: 'Cerrada',
        locked: 'Inactiva',
        lockout: 'Bloqueada'
    };
    let row = '';
    let CSV = '';

    CSV += title + '\r\n\n';

    if (hasLabel) {
        row = colNames.join(',');

        CSV += row + '\r\n';
    }

    for (var i = 0; i < info.length; i++) {
        row = '';
        const item = info[i];
        for (var j = 0; j < keys.length; j++) {
            let col = null;

            if (typeof item === 'object' && item.attrs) {
                col = status[item.attrs[keys[j]]] || item.attrs[keys[j]];
            }

            if (keys[j] === 'name') {
                if (typeof item === 'string') {
                    col = item;
                } else {
                    col = item[keys[j]] || item;
                }
            }

            if (keys[j] === 'zimbraCOSId') {
                col = cos[item.attrs[keys[j]]] || 'Sin plan';
                col = titleCase(col);
            }

            col = col || 'No definido';

            row += col + ',';
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

export function getEnabledPlansObjectByCos(cosArray, cosID) {
    const configPlans = global.window.manager_config.plans;
    const plans = {};
    const id = cosID || false;

    cosArray.forEach((cos) => {
        const key = cos.name;
        if (configPlans.hasOwnProperty(key) && configPlans[key]) {
            if (id) {
                if (cos.id === id) {
                    plans.name = key;
                    plans.id = cos.id;
                    plans.attrs = cos.attrs;
                }
            } else {
                plans[key] = {};
                plans[key].id = cos.id;
                plans[key].attrs = cos.attrs;
            }
        }
    });

    return plans;
}

export function getOwners(owners) {
    if (Array.isArray(owners)) {
        const limit = owners.length;
        const ownersArray = [];
        for (let i = 0; i < limit; i++) {
            const name = owners[i].name || { id: owners[i].id};
            ownersArray.push(name);
        }

        return ownersArray;
    }

    throw Error('Owners array no es un arreglo :' + typeof owners);
}

export function getDomainIdFromDL(dlName, arr) {
    const domainName = dlName.indexOf('@') > -1 ? dlName.split('@').pop() : dlName;

    for (const domain in arr) {
        if (arr.hasOwnProperty(domain)) {
            if (domain.constructor.name.toString().toLowerCase() === 'domain') {
                if (arr[domain].name === domainName) {
                    return arr[domain];
                }
            }
        }
    }

    return null;
}

export function getInitialDateFromTimestamp(timestamp) {
    const time = parseInt(timestamp, 10);
    const date = new Date(time).toLocaleString();
    let dateParts = date.split('/');
    const lastPosition = dateParts.pop();
    const formattedLastPosition = lastPosition.substring(0, 4);
    dateParts.push(formattedLastPosition);
    const timestampReseted = new Date(dateParts[2], (parseInt(dateParts[1], 10) - 1).toString(), dateParts[0], '00', '00', '00').getTime();

    return timestampReseted;
}

export function timestampToUTCDate(timestamp) {
    const timestampAsNumber = stringTSToNumber(timestamp);
    // const UCTTime = new Date(timestampAsNumber).toISOString();
    const utc = moment.utc(timestampAsNumber).format('YYYYMMDDHHmmss');
    return `${utc}Z`;
}

export function parseBooleanValue(boolean) {
    if (typeof boolean === 'undefined') {
        return false;
    }

    return boolean.toString().toLowerCase() === 'true';
}

export function stringTSToNumber(ts) {
    return parseInt(ts, 10);
}

export function forceTimestampFromHumanDate(date) {
    const arrDate = date.split('/').reverse();
    const newDateArr = arrDate.map((pos, i) => {
        let item = parseInt(pos, 10);
        if (i === 1) {
            const tmp = item - 1;
            item = tmp;
        }
        return item;
    });

    const formattedTimeStamp = new Date(newDateArr[0], newDateArr[1], newDateArr[2], '00', '00', '00').getTime();

    return formattedTimeStamp;
}

export function timestampToDate(timestamp) {
    const time = parseInt(timestamp, 10);
    const generatedDate = new Date(time).toLocaleString();
    const date = generatedDate.split(/\s/).shift();
    const dateArr = date.split('/');
    const dateParts = dateArr.map((item) => {
        if (item.length < 2) {
            return '0' + item;
        }

        return item;
    });
    const newDate = dateParts.join('/');

    return newDate;
}

export function setInitialDate() {
    const dateInstance = new Date();
    const day = dateInstance.getDate().toString().length < 2 ? '0' + dateInstance.getDate().toString() : dateInstance.getDate();
    const month = (dateInstance.getMonth() + 1).toString().length < 2 ? '0' + (dateInstance.getMonth() + 1).toString() : (dateInstance.getMonth() + 1);
    const formatted = `${day}/${month}/${dateInstance.getFullYear()}`;
    const date = new Date(dateInstance.getFullYear(), dateInstance.getMonth(), dateInstance.getDate(), '00', '00', '00').getTime();
    const dateObject = {
        timestamp: date,
        formatted
    };

    return dateObject;
}

export function kickOutUserWhenAuthExpired() {
    let query = `?error=${Constants.ZimbraCodes.AUTH_EXPIRED}`;

    GlobalActions.emitEndLoading();
    browserHistory.push(`/login${query}`);
}

export function handleMaxResults(caller, error) {
    if (error.code === 'account.TOO_MANY_SEARCH_RESULTS') {
        caller();
    }
}

export function getAttrsBySectionFromConfig(section, asObject) {
    const returnAsObject = asObject || false;
    const globalAttrs = window.manager_config.globalAttrsBySection;
    const currentSection = globalAttrs[section];

    if (currentSection) {
        if (!returnAsObject) {
            const attrs = Object.keys(currentSection.attrs);
            if (attrs && attrs.length > 0) {
                const attrsAsString = attrs.join();
                return attrsAsString;
            }
        }
    }

    return false;
}

export function extractLockOuts(object) {
    if (object && object.account) {
        const lockout = object.account.filter((account) => {
            if (account.attrs.zimbraAccountStatus === 'lockout') {
                return true;
            }

            return false;
        });

        if (lockout.length > 0) {
            object.lockout = lockout;
        }
    }

    return object;
}

export function parseMaxCOSAccounts(maxCosAccounts) {
    const response = {};
    let arrCos = typeof maxCosAccounts === 'string' && typeof maxCosAccounts !== 'undefined' ? maxCosAccounts.split(false) : maxCosAccounts;

    if (arrCos) {
        arrCos.forEach((p) => {
            const splitter = p.split(':');
            const key = splitter.shift();
            const value = splitter[0] ? parseInt(splitter[0], 10) : false;
            response[key] = value || 0;
        });

        return response;
    }

    return response;
}

export function getDomainsCleaned(domains) {
    var regexp = new RegExp(window.manager_config.plans.archiving.regexp, 'gi');
    const rightsDomains = domains.filter((domain) => {
        return !domain.isAliasDomain && !domain.name.match(regexp);
    });

    return rightsDomains;
}

export function findDomaindIdFromAccount(account, domains) {
    const name = typeof account === 'object' ? account.domain : account;
    const rightsDomains = domains.filter((domain) => {
        return name === domain.name;
    });

    const domainReturned = rightsDomains.length === 1 ? rightsDomains.pop() : null;

    return domainReturned;
}

export function sortByNames(a, b) {
    const name1 = typeof a === 'object' ? a.name || a.domain : a;
    const name2 = typeof b === 'object' ? b.name || b.domain : b;

    if (name1 < name2) {
        return -1;
    }

    if (name1 > name2) {
        return 1;
    }

    return 0;
}

export function makeRequest(response, dl, resolve, returnAPI, store) {
    const APIReturn = returnAPI || true;
    const keys = Object.keys(response).sort();
    const item = keys[0];
    const res = store || {};
    const action = item.match(/(remove|add)/gi);
    if (action) {
        var element = response[item];
        if (element && element.length) {
            const pop = element.pop();
            const target = typeof pop === 'object' ? pop.name || pop.id : pop;
            const label = action[0] === 'remove' ? 'eliminar' : 'agregar';
            const isNew = action[0] === 'remove' ? 0 : 1;
            return dl[item](target, (er, success) => {
                if (success) {
                    if (res.completed) {
                        res.completed.push({
                            action: label,
                            target,
                            isNew
                        });
                    } else {
                        res.completed = [{
                            action: label,
                            target,
                            isNew
                        }];
                    }
                    const api = success.api && APIReturn ? success : dl;
                    return this.makeRequest(response, api, resolve, APIReturn, res);
                }

                er.action = label;
                er.target = target;
                if (res.error) {
                    res.error.push(er);
                } else {
                    res.error = [er];
                }

                return this.makeRequest(response, dl, resolve, APIReturn, res);
            });
        } else {
            Reflect.deleteProperty(response, item);
            return this.makeRequest(response, dl, resolve, APIReturn, res);
        }
    }

    res.data = dl;
    return resolve(res);
}

export function addEventListenerFixed(element, type, callback) {
    const fixEvents = {
        blur: 'focusout'
    };

    element.addEventListener(type, callback, typeof (fixEvents[type]) !== 'undefined');
}

export function alertToBuy(callback, options) {
    const defaults = {
        title: 'Alerta',
        type: 'info',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Si, continuar',
        closeOnConfirm: true,
        showLoaderOnConfirm: false,
        animation: 'slide-from-top'
    };

    const optsExtended = options ? Object.assign(defaults, options) : defaults;

    sweetAlert(optsExtended,
        (isConfirmed) => {
            if (callback && typeof callback === 'function') {
                callback(isConfirmed, sweetAlert);
            }
        }
    );
}

export function getDaysFromDate2Date(dateFrom, dateTo) {
    // check if it receive and real object date or just string
    const from = typeof dateFrom === 'object' ? dateFrom : new Date(dateFrom);
    const to = typeof dateTo === 'object' ? dateTo : new Date(dateTo);
    // get timestamp of each date and then subtract them. just get the absolute result
    var timeDiff = Math.abs(from.getTime() - to.getTime());
    // round to up the result, and divide result of subtract with the amount of milliseconds of one day.
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
}

export function randomRange(max, min) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getHostname(nextPath) {
    const { hostname, port, protocol } = window.location;
    let host = `${protocol}//${hostname}`;
    host = port && port.length > 0 ? `${host}:${port}` : host;
    host += nextPath;
    return host;
}

export function getConfigName() {
    // return isDevMode() ? '/config/config.development.json' : 'https://manager.zboxapp.com/ventas_api/parse/functions/getConfigManager';
    return isDevMode() ? '/config/config.development.json' : '/config/config.json';
}

export function isDevMode() {
    // eslint-disable-next-line
    return process.env.NODE_ENV === 'development';
}

export function getRenovationDate(creationDate, noAvailable = 'No disponible') {
    if (!creationDate) {
        return noAvailable;
    }

    const domainCreationDate = moment(creationDate, 'YYYYMMDDHHmmssZ');
    const now = moment();

    domainCreationDate.year(now.year());
    if (domainCreationDate.isBefore(now)) {
        domainCreationDate.add(1, 'year');
    }

    return domainCreationDate.format('DD/MM/YYYY');
}

export function getTSFromUTC(utc) {
    let time = utc;
    if (!time) {
        return moment().format('x');
    }

    if (Object.prototype.toString.call(utc) === '[object Array]') {
        time = new Date(...utc);
    }

    return moment(utc, 'YYYYMMDDHHmmssZ').format('x');
}
