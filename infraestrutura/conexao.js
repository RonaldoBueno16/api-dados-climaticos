const mysql = require('mysql')

const conexao = mysql.createConnection({
    host: 'ec2-3-89-0-52.compute-1.amazonaws.com',
    port: '5432',
    user: 'huqfhjrbdjoftd',
    password: 'a75851533a05e9c43dfe0bdded4962e8ffb770eeb9a175c83d8b8d5ff7e64d98',
    database: 'd64kvt94usu3co'
})

module.exports = conexao;