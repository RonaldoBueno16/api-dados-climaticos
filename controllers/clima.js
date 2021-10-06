const clima = require("../models/clima");

module.exports = app => {
    app.post('/inserirdados', (req, res, next) => { //OK REVISADO
        console.log("oi");
        res.header("Access-Control-Allow-Origin", "*");
        const dados = req.body;

        clima.adicionar(dados, res);
    })
    app.post("/vincularesp", (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        const dados = req.body;

        clima.vincularEsp(dados, res);
    })
    app.get('/coletardados', (req, res, next) => { //OK REVISADO
        res.header("Access-Control-Allow-Origin", "*");
        console.log(req.query.auth);
        clima.coletarDadosESP(req.query.auth, res);
    })
    app.get('/coletardadosmax', (req, res, next) => { //A REVISAR
        res.header("Access-Control-Allow-Origin", "*");
        clima.coletarDadosMax(res);
    })
    app.get('/coletardadostodos', (req, res, next) => {//
        res.header("Access-Control-Allow-Origin", "*");
        clima.coletarDadosAll(res);
    })
    app.get("/", (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.json({status: "OK"})
    })
}