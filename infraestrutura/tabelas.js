class tabelas {
    init(conexao) {
        this.conexao = conexao;
        
        this.estruturarDB();
    }

    estruturarDB() {
        const sql = "CREATE TABLE IF NOT EXISTS `dados_climaticos` ( `id` INT(10) NOT NULL AUTO_INCREMENT, `umidade` INT(10) NOT NULL DEFAULT '0', `temperatura` INT(10) NOT NULL DEFAULT '0', `pressao_atmosferica` INT(10) NOT NULL DEFAULT '0', `esta_chovendo` INT(10) NOT NULL DEFAULT '0', PRIMARY KEY (`id`) USING BTREE);";
        
        this.conexao.query(sql, (erro) => {
            if(erro) {
                console.log(erro);
            }
            else {
                console.log("|| Banco de dados estruturado e pronto para uso.")
            }
        });
    }
}

module.exports = new tabelas;