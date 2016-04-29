// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

class ZimbraStoreClass {
    constructor() {
        this.zimbra = null;
        this.cos = null;
    }

    getCurrent() {
        return this.zimbra;
    }

    setCurrent(zimbra) {
        this.zimbra = zimbra;
    }

    setAllCos(cos) {
        this.cos = cos;
    }

    getAllCos() {
        return this.cos;
    }
}

var ZimbraStore = new ZimbraStoreClass();

export {ZimbraStore as default};
