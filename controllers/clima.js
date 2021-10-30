const clima = require("../models/clima");

module.exports = app => {
    app.post('/user/subscription', (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");

        const data = req.body;

        clima.registerUser(data, res);
    })
    app.get('/user/auth', (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");

        const data = req.query;

        clima.authUser(data, res);
    })
    app.post('/user/esp/vincular', (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");

        const data = req.query;

        clima.vincularEsp(data, res);
    })
    app.delete('/user/esp/desvincular/', (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        
        clima.desvincularEsp(req.query, res);
    });

    app.post('/inserirdados', (req, res, next) => { //OK REVISADO
        res.header("Access-Control-Allow-Origin", "*");
        const dados = req.body;

        clima.adicionar(dados, res);
    })
    app.get('/coletardados', (req, res, next) => { //OK REVISADO
        res.header("Access-Control-Allow-Origin", "*");
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