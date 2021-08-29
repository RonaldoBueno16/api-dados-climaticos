const customExpress = require("./config/customExpress");
let conexao = require("./infraestrutura/conexao");
const tabelas = require("./infraestrutura/tabelas");

const porta = process.env.PORT || 8080;

conexao.getConnection((err, connection) => {
    conexao = connection;
    
    if(err) {
        console.log("|| ERRO AO SE CONECTAR COM A BANCO DE DADOS.");
        console.log(err);
    }
    else {
        console.log("\n|| CONEXÃO ESTABELECIDA COM A BANCO DE DADOS ||\n");

        tabelas.init(conexao);
        
        const app = customExpress();
        app.listen(porta, () => {
            console.log("|| Servidor rodando na porta " + porta);
        });
    }
})