const mysql = require('mysql')

const conexao = mysql.createPool({
    host: '198.100.155.70',
    port: '3306',
    user: 'vegeta',
    password: 'uNC5fDdUpjaM7qqA',
    database: 'vegeta'
})

module.exports = conexao;