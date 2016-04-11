// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

class TabStateStoreClass {
    constructor() {
        this.current = null;
        this.states = {};
    }

    resetThisStore() {
        this.current = null;
        this.states = {};
    }

    getCurrent() {
        return this.current;
    }

    setCurrent(newTabState, newObject) {
        this.current = newTabState;
        this.states[this.current] = newObject;
    }
}

const TabStateStore = new TabStateStoreClass();

export {TabStateStore as default};
