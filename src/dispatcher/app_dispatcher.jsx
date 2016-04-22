// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See License.txt for license information.

import * as Flux from 'flux';

import Constants from '../utils/constants.jsx';
const PayloadSources = Constants.PayloadSources;

const AppDispatcher = Object.assign(new Flux.Dispatcher(), {
    handleViewAction: function performViewAction(action) {
        if (!action.type) {
            console.warning('handleViewAction called with undefined action type'); // eslint-disable-line no-console
        }

        var payload = {
            source: PayloadSources.VIEW_ACTION,
            action
        };
        this.dispatch(payload);
    }
});

export default AppDispatcher;
