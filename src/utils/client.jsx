// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import Promise from 'bluebird';

import ZimbraAdminApi from 'zimbra-admin-api-js';
import Powerdns from 'js-powerdns';
import ZimbraStore from '../stores/zimbra_store.jsx';
import ResetStores from '../stores/reset_stores.jsx';

import * as GlobalActions from '../action_creators/global_actions.jsx';
import * as Utils from './utils.jsx';
import Constants from './constants.jsx';

// función que maneja el error como corresponde
function handleError(methodName, err) {
    if (err.extra &&
        (err.extra.code === Constants.ZimbraCodes.AUTH_EXPIRED || err.extra.code === Constants.ZimbraCodes.AUTH__REQUIRED)
    ) {
        logout();
        return err;
    }

    console.error(methodName, err); //eslint-disable-line no-console

    const error = {
        type: Constants.MessageType.ERROR
    };

    if (err) {
        error.message = err.extra.reason;
        error.code = err.extra.code || null;
    } else {
        error.message = 'Ocurrio un error general';
    }

    return error;
}

function initZimbra() {
    return new Promise(
        (resolve, reject) => {
            const config = global.window.manager_config;
            const token = Utils.getCookie('token');
            let zimbra = ZimbraStore.getCurrent();

            if (zimbra && token) {
                window.manager_config.dns.token = token;
                return resolve(zimbra);
            } else if (token) {
                zimbra = new ZimbraAdminApi({
                    url: config.zimbraUrl
                });
                zimbra.client.token = token;
                ZimbraStore.setCurrent(zimbra);
                window.manager_config.dns.token = token;
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
                    const e = handleError('getMe', err);
                    return error(e);
                }

                Reflect.deleteProperty(data, 'obj');
                GlobalActions.saveUser(data);
                return success();
            });
        },
        (err) => {
            const e = handleError('getMe', err);
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

        Utils.setCookie('token', zimbra.client.token);
        return getMe(success, error);
    });
}

export function logout(callback) {
    const cookie = Utils.getCookie('token');
    if (cookie) {
        Utils.removeCookie('token');
    }
    ZimbraStore.setCurrent(null);
    GlobalActions.saveUser(null);
    ResetStores.resetAllStores();

    if (callback && typeof callback === 'function') {
        callback();
    }
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

export function getAllCompanies() {
    const url = global.window.manager_config.companiesEndPoints.list;

    return new Promise((resolve, reject) => {
        return $.ajax({
            url,
            dataType: 'json',
            success: function onSuccess(data) {
                resolve(data);
            },
            error: function onError(xhr, status, err) {
                reject(err);
            }
        });
    });
}

export function getCompany(id, success, error) {
    const url = global.window.manager_config.companiesEndPoints.detail.replace('{id}', id);

    return $.ajax({
        url,
        dataType: 'json',
        success: function onSuccess(data) {
            success(data);
        },
        error: function onError(xhr) {
            error(xhr.responseJSON);
        }
    });
}

export function getInvoices(id, success, error) {
    const url = global.window.manager_config.companiesEndPoints.invoices.replace('{id}', id);

    return $.ajax({
        url,
        dataType: 'json',
        success,
        error: function onError(xhr, status, err) {
            error(err);
        }
    });
}

export function getAllDomains(opts, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.getAllDomains((err, data) => {
                if (err) {
                    const e = handleError('getAllDomains', err);
                    return error(e);
                }

                return success(data);
            }, opts);
        },
        (err) => {
            const e = handleError('getAllDomains', err);
            return error(e);
        }
    );
}

export function getDomain(id, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.getDomain(id, (err, data) => {
                if (err) {
                    const e = handleError('getAllDomain', err);
                    return error(e);
                }

                return success(data);
            });
        },
        (err) => {
            const e = handleError('getAllDomain', err);
            return error(e);
        }
    );
}

export function createDomain(domain, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.createDomain(domain.name, domain.attrs, (err, data) => {
                if (err) {
                    const e = handleError('createDomain', err);
                    return error(e);
                }

                return success(data);
            });
        },
        (err) => {
            const e = handleError('createDomain', err);
            return error(e);
        }
    );
}

export function modifyDomain(domain, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.modifyDomain(domain.id, domain.attrs, (err, data) => {
                if (err) {
                    const e = handleError('modifyDomain', err);
                    return error(e);
                }

                return success(data);
            });
        },
        (err) => {
            const e = handleError('modifyDomain', err);
            return error(e);
        }
    );
}

export function modifyDomainByAttrs(domainId, attrs, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.modifyDomain(domainId, attrs, (err, data) => {
                if (err) {
                    const e = handleError('modifyDomainByAttrs', err);
                    return error(e);
                }

                return success(data);
            });
        },
        (err) => {
            const e = handleError('modifyDomainByAttrs', err);
            return error(e);
        }
    );
}

export function addDistributionList(name, attrs, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.createDistributionList(name, attrs, (err, data) => {
                if (err) {
                    const e = handleError('addDistributionList', err);
                    return error(e);
                }

                return success(data);
            });
        },
        (err) => {
            const e = handleError('addDistributionList', err);
            return error(e);
        }
    );
}

export function removeDistributionList(id, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.removeDistributionList(id, (err, data) => {
                if (err) {
                    const e = handleError('removeDistributionList', err);
                    return error(e);
                }

                return success(data);
            });
        },
        (err) => {
            const e = handleError('removeDistributionList', err);
            return error(e);
        }
    );
}

export function getAllAccounts(opts, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.getAllAccounts((err, data) => {
                if (err) {
                    const e = handleError('getAllAccounts', err);
                    return error(e);
                }

                return success(data);
            }, opts);
        },
        (err) => {
            const e = handleError('getAllAccounts', err);
            return error(e);
        }
    );
}

export function getAccount(id, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.getAccount(id, (err, data) => {
                if (err) {
                    const e = handleError('getAccount', err);
                    return error(e);
                }

                return success(data);
            });
        },
        (err) => {
            const e = handleError('getAccount', err);
            return error(e);
        }
    );
}

export function createAccount(mail, passwd, attrs, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.createAccount(mail, passwd, attrs, (err, data) => {
                if (err) {
                    const e = handleError('createAccount', err);
                    return error(e);
                }

                return success(data);
            });
        },
        (err) => {
            const e = handleError('createAccount', err);
            return error(e);
        }
    );
}

export function createAccountByBatch(mail, passwd, attrs) {
    return ZimbraStore.getCurrent().createAccount(mail, passwd, attrs);
}

export function modifyAccountByBatch(id, attrs) {
    //window.Zimbra.modifyAccount(temp1.account[0].id, {sn: 'nuevo sn'});
    return ZimbraStore.getCurrent().modifyAccount(id, attrs);
}

export function buildAccountByObject(account) {
    const zimbra = ZimbraStore.getCurrent();
    return zimbra.dictionary.classFactory('account', account, zimbra.client);
}

export function modifyAccount(idZimbra, attrs, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.modifyAccount(idZimbra, attrs, (err, data) => {
                if (err) {
                    const e = handleError('modifyAccount', err);
                    return error(e);
                }

                return success(data);
            });
        },
        (err) => {
            const e = handleError('modifyAccount', err);
            return error(e);
        }
    );
}

export function removeAccount(idZimbra, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.removeAccount(idZimbra, (err, data) => {
                if (err) {
                    const e = handleError('removeAccount', err);
                    return error(e);
                }

                return success(data);
            });
        },
        (err) => {
            const e = handleError('removeAccount', err);
            return error(e);
        }
    );
}

export function countAccounts(domain, success, error) {
    return initZimbra().then(
        (zimbra) => {
            zimbra.countAccounts(domain, (err, data) => {
                if (err) {
                    const e = handleError('removeAccount', err);
                    return error(e);
                }

                return success(data);
            });
        },
        (err) => {
            const e = handleError('removeAccount', err);
            return error(e);
        }
    );
}

export function batchCountAccount(domains, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.batchCountAccounts(domains, (err, data) => {
                if (err) {
                    const e = handleError('batchCountAccount', err);
                    return error(e);
                }

                return success(data);
            });
        },
        (err) => {
            const e = handleError('batchCountAccount', err);
            return error(e);
        }
    );
}

export function getDnsInfo(domain, success, error) {
    $.ajax({
        url: `${global.window.manager_config.dnsApiUrl}/dns`,
        type: 'POST',
        contentType: ' application/json',
        dataType: 'json',
        data: JSON.stringify({domain}),
        success: (data) => {
            const result = {
                exists: true,
                mx: 'No asignado'
            };
            if (data.byTypes.length === 0) {
                result.exists = false;
            } else {
                data.byTypes.some((b) => {
                    if (b.type === 'MX') {
                        result.mx = b.data[0].exchange;
                        return true;
                    }

                    return false;
                });
            }
            success(result);
        },
        error: function onError() {
            error('No pudimos obtener el registro MX del dominio.');
        }
    });
}

export function addAccountAlias(alias, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.addAccountAlias(alias, (err, data) => {
                if (err) {
                    const e = handleError('addAccountAlias', err);
                    return error(e);
                }

                return success(data);
            });
        },
        (err) => {
            const e = handleError('addAccountAlias', err);
            return error(e);
        }
    );
}

export function search(query, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.directorySearch(
                query,
                (err, data) => {
                    if (err) {
                        const e = handleError('search', err);
                        return error(e);
                    }

                    return success(data);
                });
        },
        (err) => {
            const e = handleError('search', err);
            return error(e);
        }
    );
}

export function batchRequest(requestArray, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.makeBatchRequest(
                requestArray,
                (err, data) => {
                    if (err) {
                        const e = handleError('batchRequest', err);
                        return error(e);
                    }

                    return success(data);
                });
        },
        (err) => {
            const e = handleError('batchRequest', err);
            return error(e);
        }
    );
}

export function getAllCos(success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.getAllCos((err, data) => {
                if (err) {
                    const e = handleError('getAllCos', err);
                    if (error) {
                        return error(e);
                    }
                }

                return success(data);
            });
        },
        (err) => {
            const e = handleError('getAllCos', err);
            if (error) {
                return error(e);
            }

            return null;
        }
    );
}

export function getAllDistributionLists(query, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.getAllDistributionLists((err, data) => {
                if (err) {
                    const e = handleError('getAllDistributionLists', err);
                    return error(e);
                }

                return success(data);
            }, query);
        },
        (err) => {
            const e = handleError('getAllDistributionLists', err);
            return error(e);
        }
    );
}

export function getDistributionList(id, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.getDistributionList(id, (err, data) => {
                if (err) {
                    const e = handleError('getDistributionList', err);
                    return error(e);
                }

                return success(data);
            });
        },
        (err) => {
            const e = handleError('getDistributionList', err);
            return error(e);
        }
    );
}

export function modifyDistributionList(id, attrs, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.modifyDistributionList(id, attrs, (err, data) => {
                if (err) {
                    const e = handleError('modifyDistributionList', err);
                    return error(e);
                }

                return success(data);
            });
        },
        (err) => {
            const e = handleError('modifyDistributionList', err);
            return error(e);
        }
    );
}

export function renameAccount(account, success, error) {
    initZimbra().then(
        (zimbra) => {
            zimbra.renameAccount(account, (err, data) => {
                if (err) {
                    const e = handleError('renameAccount', err);
                    return error(e);
                }

                return success(data);
            });
        },
        (err) => {
            const e = handleError('renameAccount', err);
            return error(e);
        }
    );
}

export function initPowerDNS() {
    /*return new Promise((resolve, reject) => {
        const api = new Powerdns({url: powerAttrs.url, token: powerAttrs.token});
        console.log(api);

        if (api) {
            return resolve(api);
        }

        return reject({
            type: Constants.MessageType.ERROR,
            message: 'PowerDNS no instanciado'
        });
    });*/
    const powerAttrs = window.manager_config.dns;
    const api = new Powerdns({url: powerAttrs.url, token: powerAttrs.token});
    return api;
}

export function createZoneWithRecords(zoneData, records, success, error) {
    const api = initPowerDNS();
    api.createZoneWithRecords(zoneData, records, (er, data) => {
        if (er) {
            return error(er);
        }

        return success(data);
    });
}

export function getZone(domain, success, error) {
    const api = initPowerDNS();
    api.getZone(domain, (er, data) => {
        if (er) {
            return error(er);
        }

        return success(data);
    });
}

export function modifyOrCreateRecords(record, success, error) {
    const api = initPowerDNS();
    api.modifyOrCreateRecords(record, (err, data) => {
        if (err) {
            const e = handleError('modifyOrCreateRecords', err);
            return error(e);
        }

        return success(data);
    });
}

export function deleteRecords(zoneUrl, record, success, error) {
    const api = initPowerDNS();
    api.deleteRecords(zoneUrl, record, (err, data) => {
        if (err) {
            const e = handleError('deleteRecords', err);
            return error(e);
        }

        return success(data);
    });
}
