// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.
const proxy = require('express-http-proxy');
const env = typeof process.env.NODE_ENV === 'undefined' ? 'development' : process.env.NODE_ENV;
const configPath = env === 'development' ? './src/config/config.development.json' : './src/config/config.json';
const config = require(configPath);
const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 8000;

const managerProxyURL = process.env.managerProxy || config.managerProxy; //eslint-disable-line no-process-env
const URlsToProxy = ['/zimbra_proxy', '/powerdns_proxy', '/folio'];

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.static(__dirname + '/dist'));

// server.post('/*', proxy(managerProxyURL));

server.all('/*', (req, res) => {
    const hasToBeProxied = URlsToProxy.find((endpoint) => req.url.toString().startsWith(endpoint));

    if (hasToBeProxied) {
        return proxy(managerProxyURL)(req, res);
    }

    res.sendFile(__dirname + '/dist/index.html');
});

server.listen(port, () => {
    console.log("ZBox Manager 1.5 is running at port:", port);
});
