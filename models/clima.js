const moment = require("moment");
const conexao = require("../infraestrutura/conexao")

class clima {
    adicionar(objeto, res) {
        const validacoes = [
            {
                nome: "Umidade",
                validacao: objeto.umidade,
                message: "Você precisa enviar os dados sobre a umidade do ar (umidade)."
            },
            {
                nome: "Temperatura",
                validacao: objeto.temperatura,
                message: "Você precisa enviar os dados sobre a temperatura (temperatura)"
            },
            {
                nome: "Pressão atmosférica",
                validacao: objeto.pressao_atmosferica,
                message: "Você precisa enviar os dados sobre a pressão atmosférica (pressao_atmosferica)"
            },
            {
                nome: "Verificar chuva",
                validacao: objeto.esta_chovendo,
                message: "Você precisa informar se está chovendo (esta_chovendo)"
            },
            {
                nome: "Verificar latitude",
                validacao: objeto.latitude,
                message: "Você precisa informar a latitude do local (latitude)"
            },
            {
                nome: "Verificar longitude",
                validacao: objeto.longitude,
                message: "Você precisa informar a longitude do local (longitude)"
            },
            {
                nome: "Verificar nome do microcontrolador",
                validacao: objeto.esp_id,
                message: "Você precisa o ID do microcontrolador (esp_id)"
            }
        ]

        const erros = validacoes.filter(campos => campos.validacao == null);
        if(erros.length) {
            res.status(400).json(erros);
        }
        else {

            const sql = `INSERT INTO dados_climaticos(datadoregistro, esp_id, umidade, temperatura, pressao_atmosferica, esta_chovendo, latitude, longitude) VALUES('${moment(new Date()).format("YYYY-MM-DD HH:mm:ss")}', '${objeto.esp_id}', ${objeto.umidade}, ${objeto.temperatura}, ${objeto.pressao_atmosferica}, ${objeto.esta_chovendo}, ${objeto.latitude}, ${objeto.longitude});`;
            conexao.query(sql, (erro, resultado) => {
                if(erro) {
                    console.log(erro);
                }
                else {
                    res.status(200).json(resultado.insertId);
                    console.log("Registro criado com sucesso! ID: " + resultado.insertId);
                }
            })
        }
    }

    coletarDadosESP(espname, res) {
        const sql = `SELECT * FROM dados_climaticos WHERE esp_id='${espname}' ORDER BY id ASC`;

        conexao.query(sql, (erro, sucess) => {
            if(erro) {
                res.status(400).json(erro);
            }
            else {
                res.status(200).json(sucess);
            }
        });
    }

    coletarDadosMax(res) {
        const sql = "SELECT * FROM dados_climaticos a WHERE a.datadoregistro = (SELECT MAX(datadoregistro) FROM dados_climaticos b WHERE a.esp_id=b.esp_id) GROUP BY esp_id ";

        conexao.query(sql, (erro, sucess) => {
            if(erro) {
                res.status(400).json(erro);
            }
            else {
                res.status(200).json(sucess);
            }
        });
    }
    
    coletarDadosAll(res) {
        const sql = "SELECT * FROM dados_climaticos ORDER BY id ASC;";

        conexao.query(sql, (erro, sucess) => {
            if(erro) {
                res.status(400).json(erro);
            }
            else {
                res.status(200).json(sucess);
            }
        });
    }
}

module.exports = new clima;