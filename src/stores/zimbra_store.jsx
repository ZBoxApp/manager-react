// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

class ZimbraStoreClass {
    constructor() {
        this.zimbra = null;
    }

    getCurrent() {
        return this.zimbra;
    }

    setCurrent(zimbra) {
        this.zimbra = zimbra;
    }
}

var ZimbraStore = new ZimbraStoreClass();

export {ZimbraStore as default};
