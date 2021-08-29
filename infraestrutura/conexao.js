const mysql = require('mysql')

const conexao = mysql.createPool({
    host: 'us-cdbr-east-04.cleardb.com',
    port: '3306',
    user: 'b06f325f729dc2',
    password: '77211caf',
    database: 'heroku_9981c230de2b387'
})

module.exports = conexao;