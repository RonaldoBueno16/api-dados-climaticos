const customExpress = require("./config/customExpress");
let conexao = require("./infraestrutura/conexao");
const tabelas = require("./infraestrutura/tabelas");
const cors = require("cors");
const bcrypt = require('bcrypt');

const porta = process.env.PORT || 3000;

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
        app.use(cors());
        
        app.listen(porta, async () => {

            const senha = await HashPassword("123123");
            console.log(senha);
            
            console.log("|| Servidor rodando na porta " + porta + " com as configurações CORS ativadas");
        });
    }
})

async function HashPassword(password) {
    const custoHash = 12;
    return bcrypt.hash(password, custoHash);
}