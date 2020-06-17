const Promise = require('bluebird');
const mysql = require('mysql2');

Promise.promisifyAll(require("mysql2/lib/connection").prototype);

const connection = mysql.createConnection({
	host: "192.168.1.111",
	user: "msalekmouad",
	password: "msalekmouad" 
});

module.exports = connection;