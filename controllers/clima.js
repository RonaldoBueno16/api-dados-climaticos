const clima = require("../models/clima");

module.exports = app => {
    app.post('/inserirdados', (req, res) => {
        const dados = req.body;

        clima.adicionar(dados, res);
    })
    app.get('/coletardados/:esp_id', (req, res) => {
        clima.coletarDadosESP(req.params.esp_id, res);
    })
    app.get('/coletardadosmax', (req, res) => {
        clima.coletarDadosMax(res);
    })
    app.get("/", (req, res) => {
        res.json({
            msg: 'OK'
        })
    })
}