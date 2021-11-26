
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
            conexao.query(SQL, (error, sucess) => {
                if(error) {
                    res.status(501).json(GenerateJsonError("invalid_json", "Não foi possível inserir o registro no banco (SQL)"));
                }
                else {
                    if(sucess.length > 0) {
                        res.status(400).json(GenerateJsonError("login_repeat", "Já tem um usuário com esse nome!"));
                    }
                    else {
                        SQL = `INSERT INTO users(user_name, user_sobrenome, user_nascimento, user_login, user_password) VALUES('${data.nome}', '${data.sobrenome}', '${data.data_nasc}', '${data.login}', '${data.senha}')`

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
            const SQL = `SELECT a.user_id,
                        a.user_name,
                        a.user_sobrenome,
                        a.user_nascimento,
                        b.user_rua,
                        b.user_cep,
                        b.user_bairro,
                        b.user_cidade,
                        b.user_uf
                        FROM users a
                        INNER JOIN address b ON a.user_id=b.user_id
                        WHERE 
                        a.user_login='${data.login}' 
                        AND 
                        a.user_password='${data.senha}'`

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

                        console.log(sucess);
                        
                        const response = {
                            auth: true,
                            token: token,
                            data: {
                                info: {
                                    user_name: sucess[0].user_name,
                                    user_sobrenome: sucess[0].user_sobrenome,
                                    user_nascimento: sucess[0].user_nascimento,
                                },
                                address: {
                                    user_bairro: sucess[0].user_bairro,
                                    user_cep: sucess[0].user_cep,
                                    user_cidade: sucess[0].user_cidade,
                                    user_uf: sucess[0].user_uf,
                                },
                            }
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
    
    getCultivos(res) {
        const SQL = "SELECT * FROM cultivos";
        conexao.query(SQL, (erro, sucess) => {
            if(erro) {
                res.status(500).json(GenerateJsonError("sql_error", "falha ao consultar o banco de dados"));
            }
            else {
                const response = {
                    data: sucess
                }
                res.status(200).json(response);
            }
        })   
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

    vincularEsp(data, res, userid) {
        const schema = {
            type: "object",
            properties: {
                esp_key: {"type": "string"},
                latitude: {"type": "float"},
                longitude: {"type": "float"},
            },
            required: ['esp_key', 'latitude', 'longitude']
        };

        if(v.validate(data, schema).valid) {
            let SQL = `SELECT u.user_id,u.user_name,u.user_login FROM users u WHERE u.user_id='${userid}'`;

            conexao.query(SQL, (err, sucess) => {
                if(err) {
                    res.status(500).json(GenerateJsonError("sql_error", "Falha ao encontrar o usuário."));
                }
                else {
                    if(sucess.length > 0) {
                        const user_id = sucess[0].user_id;
                        const latitude = data.latitude;
                        const longitude = data.longitude;

                        SQL = `SELECT esp_owner, esp_index FROM lista_esps WHERE esp_auth='${data.esp_key}'`;
                        conexao.query(SQL, (err, sucess) => {
                            if(err) {
                                res.status(500).json(GenerateJsonError("sql_error", "Falha ao encontrar o ESP."));
                            }
                            else {
                                if(sucess.length > 0) {
                                    const esp_index = sucess[0].esp_index;
                                    const esp_owner = sucess[0].esp_owner;

                                    if(esp_owner == null) {
                                        SQL = `UPDATE lista_esps SET esp_owner='${user_id}', esp_vinculacao='${moment(new Date()).format("YYYY-MM-DD HH:mm:ss")}', esp_latitude='${latitude}', esp_longitude='${longitude}' WHERE esp_index=${esp_index}`;
                                        conexao.query(SQL, (err, sucess) => {
                                            if(err) {
                                                res.status(500).json(GenerateJsonError("sql_error", "Falha ao atualizar os dados do equipamento."));
                                            }
                                            else {
                                                res.status(200).json(GenerateJsonSucess("data", {
                                                    status: 'esp_bound',
                                                    message: 'O equipamento foi vinculado ao seu usuário!'
                                                }));
                                            }
                                        });
                                    }
                                    else {
                                        res.status(401).json(GenerateJsonError("esp_owner", "Esse equipamento está cadastrado em outro dispositivo."));
                                    }
                                    
                                    
                                }
                                else {
                                    res.status(401).json(GenerateJsonError("esp_invalid", "Key inválida"));
                                }
                            }
                        });
                    }
                    else {
                        res.status(401).json(GenerateJsonError("auth_failure", "Sessão encerrada"));
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
            
            res.status(400).json(GenerateJsonError("invalid_json", {text: "Parametros insuficientes, listando abaixo [param (type)]: ", params: jsonRequest}));
        }
    }

    desvincularCultivo(data, res) {
        const schema = {
            type: "object",
            properties: {
                esp_index: {"type": "string"}
            },
            required: ['esp_index']
        };


        console.log(data);
        
        if(v.validate(data, schema).valid) {
            const SQL = `UPDATE lista_esps SET cultivos_id=NULL WHERE esp_index=${data.esp_index}`;
            conexao.query(SQL, (err, sucess) => {
                if(err) {
                    res.status(500).json(GenerateJsonError("sql_error", "Não foi possível desvincular o cultivo."));
                    console.log(err);
                }
                else {
                    let response;
                    if(sucess.affectedRows) {
                        response = {
                            sucess: true,
                            message: "Cultivo atualizado com sucesso!",
                            data: sucess
                        }
                    }
                    else {
                        response = {
                            sucess: true,
                            message: "Nenhum ESP encontrado",
                            data: sucess
                        }
                    }
                    res.status(200).json(GenerateJsonSucess("data", sucess));
                }
            })
        }
        else {
            let jsonRequest = [];
            
            Object.keys(schema.properties).forEach((item) => {
                if(data[item] == undefined || typeof(data[item]) != schema.properties[item].type) {
                    jsonRequest.push({'request': `${item} (${schema.properties[item].type})`});
                }
            })
            
            res.status(400).json(GenerateJsonError("invalid_json", {text: "Parametros insuficientes, listando abaixo [param (type)]: ", params: jsonRequest}));
        }
    }
    
    vincularCultivo(data, res) {
        const schema = {
            type: "object",
            properties: {
                esp_index: {"type": "string"},
                cultivo_id: {"type": "string"},
            },
            required: ['esp_index', 'cultivo_id']
        };


        if(v.validate(data, schema).valid) {
            const SQL = `UPDATE lista_esps SET cultivos_id=${data.cultivo_id} WHERE esp_index=${data.esp_index}`;
            conexao.query(SQL, (err, sucess) => {
                if(err) {
                    res.status(500).json(GenerateJsonError("sql_error", "Não foi possível vincular o cultivo."));
                    console.log(err);
                }
                else {
                    let response;
                    if(sucess.affectedRows) {
                        response = {
                            sucess: true,
                            message: "Cultivo atualizado com sucesso!",
                            data: sucess
                        }
                    }
                    else {
                        response = {
                            sucess: true,
                            message: "Nenhum ESP encontrado",
                            data: sucess
                        }
                    }
                    res.status(200).json(GenerateJsonSucess("data", sucess));
                }
            })
        }
        else {
            let jsonRequest = [];
            
            Object.keys(schema.properties).forEach((item) => {
                if(data[item] == undefined || typeof(data[item]) != schema.properties[item].type) {
                    jsonRequest.push({'request': `${item} (${schema.properties[item].type})`});
                }
            })
            
            res.status(400).json(GenerateJsonError("invalid_json", {text: "Parametros insuficientes, listando abaixo [param (type)]: ", params: jsonRequest}));
        }
    }

    authToken(token, res) {
        if(!token) {
            return res.status(401).json({auth: false, message: "Nenhum token de autenticação"});
        }

        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            if(err) {
                return res.status(500).json({auth: false, message: "Falha ao autenticar"});
            }
    
            const SQL = `SELECT a.user_id,
                        a.user_name,
                        a.user_sobrenome,
                        a.user_nascimento,
                        b.user_rua,
                        b.user_cep,
                        b.user_bairro,
                        b.user_cidade,
                        b.user_uf
                        FROM users a
                        INNER JOIN address b ON a.user_id=b.user_id
                        WHERE 
                        a.user_id=${decoded.userid}`
                        
            conexao.query(SQL, (err, sucess) => {
                if(err) {
                    res.status(500).json(GenerateJsonError("sql_error", "falha ao consultar o banco de dados"));
                }
                else {
                    console.log(sucess);
                    
                    const response = {
                        auth: true,
                        token: token,
                        data: {
                            info: {
                                user_name: sucess[0].user_name,
                                user_sobrenome: sucess[0].user_sobrenome,
                                user_nascimento: sucess[0].user_nascimento,
                            },
                            address: {
                                user_bairro: sucess[0].user_bairro,
                                user_cep: sucess[0].user_cep,
                                user_cidade: sucess[0].user_cidade,
                                user_uf: sucess[0].user_uf,
                            },
                        }
                    }          
                    res.status(200).json(response);
                }
            })
        })
    }
    
    desvincularEsp(data, res, userid) {
        const schema = {
            type: "object",
            properties: {
                esp_index: {"type": "string"}
            },
            required: ['esp_index']
        };

        
        if(v.validate(data, schema).valid) {
            let SQL = `SELECT user_id FROM users WHERE user_id='${userid}'`;

            conexao.query(SQL, (err, sucess) => {
                if(err) {
                    res.status(500).json(GenerateJsonError("sql_error", "Falha ao encontrar o usuário."));
                }
                else {
                    if(sucess.length > 0) {
                        const user_id = sucess[0].user_id;
                        
                        SQL = `SELECT esp_owner FROM lista_esps WHERE esp_index='${data.esp_index}' OR esp_auth='${data.esp_index}'`;
                        conexao.query(SQL, (err, sucess) => {
                            if(err) {
                                res.status(500).json(GenerateJsonError("sql_error", "Falha ao encontrar o ESP."));
                            }
                            else {
                                if(sucess.length) {
                                    const owner = sucess[0].esp_owner;
                                    if(owner != user_id) {
                                        if(owner == null) {
                                            res.status(401).json(GenerateJsonError("esp_owner", "Esse não está cadastrado em nenhum dispositivio."));
                                        }
                                        else {
                                            res.status(401).json(GenerateJsonError("esp_owner", "Esse equipamento está cadastrado em outro dispositivo."));
                                        }
                                    }
                                    else {
                                        SQL = `UPDATE lista_esps SET esp_owner=NULL, esp_latitude=NULL, esp_longitude=NULL, esp_vinculacao=NULL WHERE esp_index=${data.esp_index}`;

                                        conexao.query(SQL, (err, sucess) => {
                                            if(err) {
                                                res.status(500).json(GenerateJsonError("sql_error", "Falha ao atualizar o ESP."));
                                            }
                                            else {
                                                res.status(200).json(GenerateJsonSucess("data", {
                                                    status: 'esp_unbind',
                                                    message: 'O equipamento foi desvinculado com sucesso!'
                                                }));
                                            }
                                        })
                                    }
                                }
                                else {
                                    res.status(400).json(GenerateJsonError("invalid_esp", "ESP inválido!"));
                                }
                                
                            }
                        })
                    }
                    else {
                        res.status(400).json(GenerateJsonError("auth_failure", "Sessão encerrada."));
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
            
            res.status(400).json(GenerateJsonError("invalid_json", {text: "Parametros insuficientes, listando abaixo [param (type)]: ", params: jsonRequest}));
        }
    }

    getEspDay(data, res) {
        const schema = {
            type: 'object',
            properties: {
                user_id: {"type": "'string'"},
                esp_index: {"type": "'string'"},
                day: {"type": "'string'"},
                month: {"type": "'string'"},
                year: {"type": "'string'"}
            },
            required: ['user_id', 'esp_index', 'day', 'month', 'year']
        };


        if(v.validate(data, schema).valid) {
            let SQL = `SELECT user_id FROM users WHERE user_id='${data.user_id}'`;
            conexao.query(SQL, (err, sucess) => {
                if(err) {
                    res.status(500).json(GenerateJsonError("sql_error", "Falha ao encontrar o usuário."));
                }
                else {
                    if(sucess.length) {
                        SQL = `SELECT * FROM dados_climaticos WHERE esp_index='${data.esp_index}' AND datadoregistro BETWEEN '${data.year}-${data.month}-${data.day} 00:00:00' AND '${data.year}-${data.month}-${data.day} 23:59:59' ORDER BY datadoregistro ASC`
                        conexao.query(SQL, (err, sucess) => {
                            if(err) {
                                res.status(500).json(GenerateJsonError("sql_error", "Falha ao encontrar o ESP."));
                            }
                            else {
                                res.status(200).json(GenerateJsonSucess("Listando todos os ESP's do usuário", sucess));
                            }
                        });
                    }  
                    else {
                        res.status(400).json(GenerateJsonError("auth_failure", "Sessão encerrada."));
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
            
            res.status(400).json(GenerateJsonError("invalid_json", {text: "Parametros insuficientes, listando abaixo [param (type)]: ", params: jsonRequest}));
        }
    }

    getUserCultivos(res, userid) {
        let SQL = `SELECT e.esp_index, e.esp_nome, c.* FROM lista_esps e INNER JOIN cultivos c ON e.cultivos_id=c.id WHERE e.esp_owner='${userid}'`;
        conexao.query(SQL, (err, sucess) => {
            if(err) {
                res.status(500).json(GenerateJsonError("sql_error", "Falha ao encontrar o usuário."));
            }
            else {
                
                res.status(200).json(GenerateJsonSucess("data", sucess));
            }
        });
    }
    
    getRegAllDay(data, res, userid) {
        const schema = {
            type: "object",
            properties: {
                esp_index: {"type": "string"},
            },
            required: ['esp_index']
        };

        if(v.validate(data, schema).valid) {
            let SQL = `SELECT user_id FROM users WHERE user_id='${userid}'`;

            conexao.query(SQL, (err, sucess) => {
                if(err) {
                    res.status(500).json(GenerateJsonError("sql_error", "Falha ao encontrar o usuário."));
                }
                else {
                    if(sucess.length == 0) {
                        res.status(400).json(GenerateJsonError("auth_failure", "Sessão encerrada."));
                    }
                    else {
                        SQL = `SELECT esp_latitude, esp_longitude FROM lista_esps WHERE esp_index=${data.esp_index}`
                        console.log(SQL);
                        conexao.query(SQL, (err, sucess) => {
                            if(err) {
                                res.status(400).json(GenerateJsonError("sql_error", "Não foi possível encontrar o ESP"));
                            }
                            else {
                                if(sucess.length) {
                                    const latitude = sucess[0].esp_latitude;
                                    const longitude = sucess[0].esp_longitude;

                                    SQL = `SELECT DISTINCT DATE_FORMAT(a.datadoregistro, '%d/%m/%Y') AS data_registro,
                                            COUNT(*) AS registros,
                                            AVG(a.temperatura) AS media_temperatura,
                                            AVG(a.luminosidade) AS media_luminosidade,
                                            AVG(a.pressao) AS media_pressao,
                                            AVG(a.umidade) AS media_umidade,
                                            AVG(a.chuva) AS media_chuva,
                                            MIN(a.temperatura) AS minimo_temperatura,
                                            MAX(a.temperatura) AS maximo_temperatura,
                                            (SELECT DATE_FORMAT(b.datadoregistro, '%H:%m:%s') FROM dados_climaticos b WHERE b.temperatura=MIN(a.temperatura) LIMIT 1) AS hora_mintemperatura,
                                            (SELECT DATE_FORMAT(b.datadoregistro, '%H:%m:%s') FROM dados_climaticos b WHERE b.temperatura=MAX(a.temperatura) LIMIT 1) AS hora_maxtemperatura,
                                            (SELECT DATE_FORMAT(b.datadoregistro, '%H:%m:%s') FROM dados_climaticos b WHERE b.luminosidade=MAX(a.luminosidade) LIMIT 1) AS hora_maxluminosidade,
                                            (SELECT DATE_FORMAT(b.datadoregistro, '%H:%m:%s') FROM dados_climaticos b WHERE b.luminosidade=MIN(a.luminosidade) LIMIT 1) AS hora_minluminosidade
                                            FROM dados_climaticos a
                                            WHERE a.esp_index='${data.esp_index}'
                                            GROUP BY data_registro ORDER BY data_registro ASC`;
                        
                                    conexao.query(SQL, (err, sucess) => {
                                        if(err) {
                                            res.status(400).json(GenerateJsonError("sql_error", err));
                                        }
                                        else {
                                            res.status(200).json(GenerateJsonSucess("Listando todas as datas e quantidade de registros", {
                                                latitude: latitude,
                                                longitude: longitude,
                                                registros: sucess
                                            }));
                                        }
                                    })
                                }
                                else {
                                    res.status(400).json(GenerateJsonError("sql_error", "Não foi possível encontrar o ESP"));
                                }
                            }
                        })
                        
                        
                    }
                }
            })
        }
        else {
            let jsonRequest = [];
            
            Object.keys(schema.properties).forEach((item) => {
                if(data[item] == undefined || typeof(data[item]) != schema.properties[item].type) {
                    jsonRequest.push({'request': `${item} (${schema.properties[item].type})`});
                }
            })
            
            res.status(400).json(GenerateJsonError("invalid_json", {text: "Parametros insuficientes, listando abaixo [param (type)]: ", params: jsonRequest}));
        }
    }

    getAllESP(data, res, userid) {
        let SQL = `SELECT user_id FROM users WHERE user_id='${userid}'`;

        conexao.query(SQL, (err, sucess) => {
            if(err) {
                    res.status(500).json(GenerateJsonError("sql_error", "Falha ao encontrar o usuário."));
            }
            else {
                    if(sucess.length == 0) {
                        res.status(400).json(GenerateJsonError("auth_failure", "Sessão encerrada."));
                    }
                    else {
                        SQL = `SELECT esp_index, esp_latitude, esp_longitude, esp_vinculacao, esp_nome, cultivos_id, (SELECT b.nome FROM cultivos b WHERE b.id=a.cultivos_id) as nome_cultivo FROM lista_esps a WHERE esp_owner = '${userid}'`;
                        
                        conexao.query(SQL, (err, sucess) => {
                            if(err) {
                                res.status(400).json(GenerateJsonError("sql_error", err));
                            }
                            else {
                                res.status(200).json(GenerateJsonSucess("Listando todos os ESP's do usuário", sucess));
                            }
                        })
                    }
            }
        })
    }
    
    
    coletarDadosESP(auth_key, res) {
        if(auth_key == '') {
            res.status(500).json(GenerateJsonError("sql_error", "Uso correto endpoint: /coletardados?auth=esp_key}"));
        }
        else {
            const sql = `SELECT a.esp_auth, a.esp_index, a.esp_nome, b.* FROM lista_esps a INNER JOIN dados_climaticos b ON a.esp_index=b.esp_index WHERE a.esp_auth='${auth_key}' ORDER BY b.datadoregistro LIMIT 10;`
            
            conexao.query(sql, (erro, sucesso) => {
                if(erro) {
                    res.status(500).json(GenerateJsonError("sql_error", "falha ao consultar o banco de dados"));
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