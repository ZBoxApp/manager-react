// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import Promise from 'bluebird';

import ZimbraAdminApi from 'zimbra-admin-api-js';
import ZimbraStore from '../stores/zimbra_store.jsx';

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
        ZimbraStore.setCurrent(zimbra);
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

export function getCompany(id) {
    const url = global.window.manager_config.companiesEndPoints.detail.replace('{id}', id);

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
                {
                    query
                },
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
                    return error(e);
                }

                return success(data);
            });
        },
        (err) => {
            const e = handleError('getAllCos', err);
            return error(e);
        }
    );
}
