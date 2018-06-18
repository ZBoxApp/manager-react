// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.
const proxy = require('express-http-proxy');
const fs = require('fs');
const path = require('path');
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

const mimes = {
    js: 'text/javascript',
    json: 'application/json',
    css: 'text/css',
    png: 'image/png',
    jpg: 'image/jpg',
    svg: 'image/svg+xml',
    eot: 'application/vnd.ms-fontobject',
    woff2: 'application/font-woff2',
    woff: 'application/font-woff',
    ttf: 'application/x-font-truetype'
};

server.all('/*', (req, res) => {
    const hasToBeProxied = URlsToProxy.find((endpoint) => req.url.toString().startsWith(endpoint));

    if (hasToBeProxied) {
        return proxy(managerProxyURL)(req, res);
    }

    const mime = (/\.(js|json|css|jpg|png|gif|svg|ttf|eot|woff|woff2|map)$/).exec(req.url.toString());
    if (mime) {
        const ext = mime[1];
        const filename = path.join(__dirname, 'dist', req.url.toString().substring(1));
        return sendFileContent(res, filename, mimes[ext]);
    }

    res.sendFile(__dirname + '/dist/index.html');
});

function sendFileContent(response, fileName, contentType) {
    fs.readFile(fileName, (err, data) => {
        if (err) {
            response.writeHead(404);
            response.write('Not Found!');
        } else {
            response.writeHead(200, {'Content-Type': contentType});
            response.write(data);
        }
        response.end();
    });
}

server.listen(port, () => {
    console.log("ZBox Manager 1.5 is running at port:", port);
});
