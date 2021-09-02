
const { type } = require("jquery");
const moment = require("moment");
const conexao = require("../infraestrutura/conexao")



class clima {
    adicionar(objeto, res) {
        const validacoes = [
            {//Verificar autenticação
                nome: "Autenticação",
                validacao: objeto.esp_key,
                message: "Chave de autenticação não informada"
            },
            //Verificar sensores
            {
                nome: "Sensor de umidade",
                validacao: objeto.sensors.umidade,
                message: "Dados do sensor de umidade não informado"
            },
            {
                nome: "Sensor de temperatura",
                validacao: objeto.sensors.temperatura,
                message: "Dados do sensor de temperatura não informado"
            },
            {
                nome: "Sensor de luminosidade",
                validacao: objeto.sensors.luminosidade,
                message: "Dados do sensor de luminosidade não informado"
            },
            {
                nome: "Sensor de pressao",
                validacao: objeto.sensors.pressao,
                message: "Dados do sensor de pressao não informado"
            },
            {
                nome: "Sensor de altitude",
                validacao: objeto.sensors.altitude,
                message: "Dados do sensor de altitude não informado"
            },
            {
                nome: "Sensor de chuva",
                validacao: objeto.sensors.chuva,
                message: "Dados do sensor de chuva não informado"
            }
        ]

        const erros = validacoes.filter(campos => campos.validacao == null);
        if(erros.length) {
            res.status(400).json(GenerateJsonError("authentication_failure", "Falha na chave de autenticação"));
        }
        else {
            //Verificar autenticação
            let sql = `SELECT esp_index FROM lista_esps a WHERE a.esp_auth='${objeto.esp_key}';`
            conexao.query(sql, (erro, sucess) => {
                if(erro) {
                    res.status(500).json(GenerateJsonError("sql_error", "falha ao consultar o banco de dados"));
                    console.log(erro);
                }
                else {
                    if(sucess.length == 0) {
                        res.status(400).json(GenerateJsonError("authentication_failure", "Falha na chave de autenticação"));
                    }
                    else {
                        const esp_index = sucess[0].esp_index


                        sql = `INSERT INTO dados_climaticos(esp_index,datadoregistro,umidade,temperatura,luminosidade,pressao,altitude,chuva) VALUES(${esp_index},'${moment(new Date()).format("YYYY-MM-DD HH:mm:ss")}', ${objeto.sensors.umidade}, ${objeto.sensors.temperatura}, ${objeto.sensors.luminosidade}, ${objeto.sensors.pressao}, ${objeto.sensors.altitude}, ${objeto.sensors.chuva})`
                        conexao.query(sql, (erro, sucess) => {
                            if(erro) {
                                res.status(500).json(GenerateJsonError("sql_error", "falha ao consultar o banco de dados"));
                                console.log(erro);
                            }
                            else {
                                res.status(200).json(GenerateJsonSucess("registro inserido com sucesso", {insertId: sucess.insertId}))
                            }
                        })
                    }
                }
            })
        }
    }

    vincularEsp(objeto, res) {
        
    }
    
    coletarDadosESP(auth_key, res) {
        const sql = `SELECT * FROM dados_climaticos WHEREa esp_index = (SELECT esp_index FROM lista_esps WHERE esp_auth='${auth_key}');`
        
        conexao.query(sql, (erro, sucesso) => {
            if(erro) {
                res.status(500).json(GenerateJsonError("sql_error", "falha ao consultar o banco de dados"));
                console.log(erro);
            }
            else {
                res.status(200).json(GenerateJsonSucess("OK",sucesso));
            }
        });
    }

    coletarDadosMax(res) {
        const sql = "SELECT * FROM dados_climaticos a WHERE a.datadoregistro = (SELECT MAX(datadoregistro) FROM dados_climaticos b WHERE a.esp_index=b.esp_index) GROUP BY esp_index;";

        conexao.query(sql, (erro, sucess) => {
            if(erro) {
                res.status(500).json(GenerateJsonError("sql_error", "falha ao consultar o banco de dados"));
                console.log(erro);
            }
            else {
                res.status(200).json(GenerateJsonSucess("OK", sucess));
            }
        });
    }
    
    coletarDadosAll(res) {
        const sql = "SELECT * FROM dados_climaticos ORDER BY reg_index ASC;";

        conexao.query(sql, (erro, sucess) => {
            if(erro) {
                res.status(500).json(GenerateJsonError("sql_error", "falha ao consultar o banco de dados"));
                console.log(erro);
            }
            else {
                res.status(200).json(GenerateJsonSucess("OK", sucess));
            }
        });
    }
}

module.exports = new clima;

function GenerateJsonError(_type, _message) {
    const json_ = {
        message: _message,
        type: _type,
        sucess: false
    }
    return json_;
}

function GenerateJsonSucess(_message, _data) {
    const json_ = {
        message: _message,
        type: "sucess_message",
        sucess: true,
        data: _data
    }
    return json_;
}