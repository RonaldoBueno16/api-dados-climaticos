const customExpress = require("./config/customExpress");
const conexao = require("./infraestrutura/conexao");
const tabelas = require("./infraestrutura/tabelas");

const porta = process.env.PORT || 8877;

conexao.connect((erro) => {
    if(erro) {
        console.log("|| ERRO AO SE CONECTAR COM A BANCO DE DADOS.");
        console.log(erro);
    }
    else {
        console.log("\n|| CONEXÃO ESTABELECIDA COM A BANCO DE DADOS ||\n");

        tabelas.init(conexao);
        
        const app = customExpress();
        app.listen(porta || 8877, () => {
            console.log("|| Servidor rodando na porta " + porta);
        });
    }
});