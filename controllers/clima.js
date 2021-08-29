const clima = require("../models/clima");

module.exports = app => {
    app.post('/inserirdados', (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        const dados = req.body;

        clima.adicionar(dados, res);
    })
    app.get('/coletardados/:esp_id', (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        clima.coletarDadosESP(req.params.esp_id, res);
    })
    app.get('/coletardadosmax', (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        clima.coletarDadosMax(res);
    })
    app.get('/coletardadostodos', (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        clima.coletarDadosAll(res);
    })
    app.get("/", (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.json({
            msg: 'API rodando......'
        })
    })
}