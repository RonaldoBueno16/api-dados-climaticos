const mysql = require('mysql')

const conexao = mysql.createPool({
    host: 'localhost',
    port: '3306',
    user: 'vegeta',
    password: 'uNC5fDdUpjaM7qqA',
    database: 'vegeta'
})

module.exports = conexao;