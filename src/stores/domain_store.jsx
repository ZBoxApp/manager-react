// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

class DomainStoreClass {
    constructor() {
        this.current = null;
    }

    getCurrent() {
        return this.current;
    }

    setCurrent(domain) {
        this.current = domain;
    }

    getCurrentId() {
        const domain = this.getCurrent();

        if (domain) {
            return domain.id;
        }

        return null;
    }
}

const DomainStore = new DomainStoreClass();

export {DomainStore as default};
