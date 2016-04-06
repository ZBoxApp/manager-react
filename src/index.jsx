// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import './sass/styles.scss';

import $ from 'jquery';
import * as Client from './utils/client.jsx';

function preRenderSetup(callwhendone) {
    const d1 = Client.getClientConfig(
        (data) => {
            if (!data) {
                return;
            }

            global.window.manager_config = data;
        },
        (err) => {
            console.error(err); //eslint-disable-line no-console
        }
    );

    $.when(d1).done(callwhendone);
}

function renderRootComponent() {
    console.log('eliminar'); //eslint-disable-line no-console
}

global.window.setup_root = () => {
    // Do the pre-render setup and call renderRootComponent when done
    preRenderSetup(renderRootComponent);
};

global.window.Zimbra = Client;
