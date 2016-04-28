/**
 * Created by enahum on 4/25/16.
 */
const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const _ = require('lodash');
const moment = require('moment');

const port = normalizePort(process.env.PORT || '8001'); //eslint-disable-line no-process-env

const app = express();

app.set('port', port);

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.get('/list', (req, res) => {
    readCompanies().
    then((data) => {
        return res.json(data);
    }).
    catch((err) => {
        return res.status(500).json(err);
    });
});

app.get('/company/:id', (req, res) => {
    readCompanies().
    then((data) => {
        const company = _.find(data, {id: req.params.id});
        if (company) {
            return res.json(company);
        }

        return res.status(404).json({
            code: 404,
            message: 'Company not found'
        });
    }).
    catch((err) => {
        return res.status(500).json(err);
    });
});

app.get('/company/:id/invoices', (req, res) => {
    return res.json([
        {
            number: 355,
            link: 'http://google.com',
            date: moment('2016-01-01').toJSON(),
            total: '$ 54.490',
            status: 1
        },
        {
            number: 356,
            link: 'http://google.com',
            date: moment('2016-02-01').toJSON(),
            total: '$ 54.490',
            status: 2
        },
        {
            number: 357,
            date: moment('2016-02-01').toJSON(),
            total: '$ 54.490',
            status: 3
        },
        {
            number: 358,
            link: 'http://google.com',
            date: moment('2016-03-01').toJSON(),
            total: '$ 54.490',
            status: 0
        }
    ]);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res) => {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    const p = parseInt(val, 10);

    if (isNaN(p)) {
        // named pipe
        return val;
    }

    if (p >= 0) {
        // port number
        return p;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
    case 'EACCES':
        console.error(bind + ' requires elevated privileges'); //eslint-disable-line no-console
        process.exit(1); //eslint-disable-line no-process-exit
        break;
    case 'EADDRINUSE':
        console.error(bind + ' is already in use'); //eslint-disable-line no-console
        process.exit(1); //eslint-disable-line no-process-exit
        break;
    default:
        throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.info('ZBox Companies Test Server listening on ' + bind); //eslint-disable-line no-console
}

function readCompanies() {
    return new Promise((resolve, reject) => {
        const filename = path.join(__dirname, 'companies', 'list.json');
        fs.readFile(filename, (err, data) => {
            if (err) {
                return reject(err);
            }

            return resolve(JSON.parse(data));
        });
    });
}
