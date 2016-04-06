// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

export default class Domain {
    constructor(connection) {
        this.zimbra = connection;
    }

    get(name, by, attrs, success, error) {
        if (this.zimbra) {
            this.zimbra.getRequest({}, (err, req) => {
                if (err) {
                    return error(err);
                }

                return req.addRequest({
                    name: 'GetDomainRequest',
                    namespace: 'zimbraAdmin',
                    params: {
                        domain: {
                            attrs,
                            by,
                            _content: name
                        }
                    }
                }, (er) => {
                    if (er) {
                        return error(er);
                    }

                    return this.zimbra.send(req, (err2, response) => {
                        if (err2) {
                            return error(err2);
                        }

                        return success(response.get().GetAccountInfoResponse);
                    });
                });
            });
        }
    }
}
