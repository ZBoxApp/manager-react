// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

const http = require('http');
const fs = require('fs');
const path = require('path');
const httpProxy = require('http-proxy');
const config = require('./src/config/config.json');

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

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    const zimbraProxy = process.env.zimbra || config.zimbraProxy; //eslint-disable-line no-process-env

    if (req.url.indexOf('/service') === 0) {
        return proxy.web(req, res, {target: zimbraProxy, secure: false});
    }

    const mime = (/^\/[a-zA-Z0-9\/]*\.(js|json|css|jpg|png|gif|svg|ttf|eot|woff|woff2)$/).exec(req.url.toString());
    if (mime) {
        const ext = mime[1];
        const filename = path.join(__dirname, 'dist', req.url.toString().substring(1));
        return sendFileContent(res, filename, mimes[ext]);
    }

    return sendFileContent(res, 'dist/index.html', 'text/html');
});

server.listen(8000);

server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.info('ZBox Manager 2.0 Test Server listening on ' + bind); //eslint-disable-line no-console
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
