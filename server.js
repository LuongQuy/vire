#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('./app');
var debug = require('debug')('project:server');
var http = require('http');
// var https = require('https');
var fs = require('fs');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

// var options = {
// 	key: fs.readFileSync('rootSSL.key'),
// 	cert: fs.readFileSync('rootSSL.pem'),
// 	passphrase: '12345',
// 	requestCert: false,
// 	rejectUnauthorized: false
// };

var server = http.createServer(app);
// var server = https.createServer(options, app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// socket io
const io = require('socket.io')(server);
var arrUser = [];
var arrayClass = [];
io.on('connection', (socket) => {

    socket.on('CLICK_PRE_BTN', msg => {
        console.log(msg);
    });
    // console.log(socket.id + 'da ket noi');
    // console.log(socket.adapter.rooms);
    socket.on('CLIENT_SEND_ACCOUNT', (account) => {
        if (arrUser.indexOf(account) >= 0) {
            socket.emit('SERVER_SEND_FAIL');
        } else {
            arrUser.push(account);
            socket.username = account;
            socket.emit('SERVER_SEND_SUCCESS');
            io.sockets.emit('SERVER_SEND_ARRAY_USER', arrUser);
            io.sockets.emit('SERVER_SEND_ARRAY_CLASS', arrayClass);
        }
    });

    socket.on('LOGOUT', () => {
        arrUser.splice(
            arrUser.indexOf(socket.username, 1)
        );
        socket.broadcast.emit('SERVER_SEND_ARRAY_USER', arrUser);
    });

    socket.on('disconnect', () => {
        arrUser.splice(
            arrUser.indexOf(socket.username, 1)
        );
        socket.broadcast.emit('SERVER_SEND_ARRAY_USER', arrUser);
    });

    socket.on('CLIENT_SEND_MESSAGE', (data) => {
        io.sockets.emit('SERVER_SEND_MESSAGE', { username: data.username, message: data.message });
    });


    socket.on('CLIENT_CREATE_CLASS', (className) => {
        socket.join(className);
        socket.class = className;

        

        arrayClass.push(className);
        io.sockets.emit('SERVER_SEND_ARRAY_CLASS', arrayClass);
        socket.emit('SERVER_SEND_ROOM_SOCKET', className);
    });


});
// end socket io

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
	var port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
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

	var bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
	var addr = server.address();
	var bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	debug('Listening on ' + bind);
}
