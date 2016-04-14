// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

class UserStoreClass {
    constructor() {
        this.currentUser = {};
    }

    getCurrentUser() {
        return this.currentUser;
    }

    setCurrentUser(user) {
        this.currentUser = user;
    }

    getCurrentId() {
        var user = this.getCurrentUser();

        if (user) {
            return user.id;
        }

        return null;
    }
}

var UserStore = new UserStoreClass();

export {UserStore as default};
