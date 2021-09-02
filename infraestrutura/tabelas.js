class tabelas {
    init(conexao) {
        this.conexao = conexao;
        
        this.estruturarDB();
    }

    
    
    
    estruturarDB() {
        let sql = "CREATE TABLE IF NOT EXISTS `dados_climaticos` (`reg_index` INT(10) NOT NULL AUTO_INCREMENT,`esp_index` INT(11) NOT NULL DEFAULT '0',`datadoregistro` DATETIME NULL DEFAULT NULL,`umidade` INT(10) NOT NULL DEFAULT '0',`temperatura` INT(10) NOT NULL DEFAULT '0',`luminosidade` INT(10) NOT NULL DEFAULT '0',`pressao` INT(10) NOT NULL DEFAULT '0',`altitude` INT(11) NOT NULL DEFAULT '0',`chuva` INT(11) NOT NULL DEFAULT '0',PRIMARY KEY (`reg_index`));";

        this.conexao.query(sql, (erro) => {
            if(erro) {
                console.log(erro);
            }
            else {
                sql = "CREATE TABLE IF NOT EXISTS `lista_esps` (`esp_index` INT(11) NOT NULL AUTO_INCREMENT,`esp_nome` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_bin',`esp_auth` TEXT NOT NULL COLLATE 'latin1_bin',PRIMARY KEY (`esp_index`));";

                this.conexao.query(sql, (erro) => {
                    if(erro) {
                        console.log(erro);
                    }
                    else {
                        console.log("Tabelas estruturadas")
                    }
                });
            }
        });
    }
}

module.exports = new tabelas;