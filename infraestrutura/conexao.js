const mysql = require('mysql')

const conexao = mysql.createPool({
    /*host: 'us-cdbr-east-04.cleardb.com',
    port: '3306',
    user: 'b06f325f729dc2',
    password: '77211caf',
    database: 'heroku_9981c230de2b387'*/

    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: 'espdb'
})

module.exports = conexao;