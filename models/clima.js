
const { type } = require("jquery");
const moment = require("moment");
const conexao = require("../infraestrutura/conexao")
const {Validator} = require("jsonschema");
const { json } = require("body-parser");
const { hash } = require("bcrypt");

const v = new Validator();

require("dotenv-safe").config();
const jwt = require('jsonwebtoken');

class clima {
    registerUser(data, res) {
        const schema = {
            type: "object",
            properties: {
                event: {"type": "string"},
                nome: {"type": "string"},
                sobrenome: {"type": "string"},
                data_nasc: {"type": "string"},
                cep: {"type": "number"},
                rua: {"type": "string"},
                bairro: {"type": "string"},
                cidade: {"type": "string"},
                UF: {"type": "string"},
                login: {"type": "string"},
                senha: {"type": "string"}
            },
            required: ['event', 'nome', 'sobrenome', 'data_nasc', 'cep', 'rua', 'bairro', 'cidade', 'UF', 'login', 'senha']
        };

        let SQL = "";
        if(v.validate(data, schema).valid) {
            
            SQL = `SELECT user_id FROM users WHERE user_login='${data.login}'`;
            console.log(SQL);
            conexao.query(SQL, (error, sucess) => {
                if(error) {
                    res.status(501).json(GenerateJsonError("invalid_json", "Não foi possível inserir o registro no banco (SQL)"));
                }
                else {
                    if(sucess.length > 0) {
                        res.status(401).json(GenerateJsonError("login_repeat", "Já tem um usuário com esse nome!"));
                    }
                    else {
                        SQL = `INSERT INTO users(user_name, user_sobrenome, user_nascimento, user_sexo, user_login, user_password) VALUES('${data.nome}', '${data.sobrenome}', '${data.data_nasc}', '${data.sexo}', '${data.login}', '${data.senha}')`

                        conexao.query(SQL, (error, sucess) => {
                            if(error) {
                                res.status(501).json(GenerateJsonError("invalid_json", "Não foi possível inserir o registro no banco (SQL)"));
                            }
                            else {
                                const insertId = sucess.insertId;
                                SQL = `INSERT INTO address(user_id, user_cep, user_rua, user_bairro, user_cidade, user_uf) VALUES(${insertId}, '${data.cep}', '${data.rua}', '${data.bairro}', '${data.cidade}', '${data.UF}')`;

                                conexao.query(SQL, (error, sucess) => {
                                    if(error) {
                                        res.status(501).json(GenerateJsonError("invalid_json", "Não foi possível inserir o registro no banco (SQL)"));
                                    }
                                    else {
                                        res.status(201).json(GenerateJsonSucess("Usuário cadastrado com sucesso", {'user_id': insertId}))
                                    }
                                })
                            }
                        })
                    }
                }
            });
        }
        else {
            let jsonRequest = [];
            
            Object.keys(schema.properties).forEach((item) => {
                if(data[item] == undefined || typeof(data[item]) != schema.properties[item].type) {
                    jsonRequest.push({'request': `${item} (${schema.properties[item].type})`});
                }
            })
            
            res.status(400).json(GenerateJsonError("invalid_json", {text: "Parametros insuficientes, listando abaixo [param (type)]: ", parametros_faltantes: jsonRequest}));
        }
    }

    authUser(data, res) {
        const schema = {
            type: "object",
            properties: {
                event: {"type": "string"},
                login: {"type": "string"},
                senha: {"type": "string"}
            },
            required: ['event', 'login', 'senha']
        };

        if(v.validate(data, schema).valid) {
            const SQL = `SELECT user_id FROM users WHERE user_login='${data.login}' AND user_password='${data.senha}'`;

            conexao.query(SQL, (erro, sucess) => {
                if(erro) {
                    res.status(501).json(GenerateJsonError("invalid_json", "Não foi possível inserir o registro no banco (SQL)"));
                }
                else {
                    if(sucess.length == 0) {
                        const response = {
                            auth: false,
                            token: null
                        };
                        res.status(200).json(response);
                        // res.status(200).json(GenerateJsonError("auth_failure", "Não foi encontrado nenhum usuário com essas credenciais."));
                    }
                    else {
                        const userid = sucess[0].user_id;

                        const token = jwt.sign({userid}, process.env.SECRET);

                        const response = {
                            auth: true,
                            token: token
                        }
                        
                        res.status(200).json(response);
                    }
                }
            });
        }
        else {
            let jsonRequest = [];
            
            Object.keys(schema.properties).forEach((item) => {
                if(data[item] == undefined || typeof(data[item]) != schema.properties[item].type) {
                    jsonRequest.push({'request': `${item} (${schema.properties[item].type})`});
                }
            })
            
            res.status(400).json(GenerateJsonError("invalid_json", {text: "Parametros insuficientes, listando abaixo [param (type)]: ", parametros_faltantes: jsonRequest}));
        }
    }
    
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
        console.log(auth_key);
        if(auth_key == '') {
            res.status(500).json(GenerateJsonError("sql_error", "Uso correto endpoint: /coletardados?auth=esp_key}"));
        }
        else {
            const sql = `SELECT a.esp_auth, a.esp_index, a.esp_nome, b.* FROM lista_esps a INNER JOIN dados_climaticos b ON a.esp_index=b.esp_index WHERE a.esp_auth='${auth_key}' ORDER BY b.datadoregistro LIMIT 10;`
            
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

