const clima = require("../models/clima");

const jwt = require('jsonwebtoken');

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

    app.post('/inserirdados', (req, res, next) => { //OK REVISADO
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
        clima.coletarDadosESP(req.query.auth, res);
    })
    app.get('/coletardadosmax', verifyJWT, (req, res, next) => { //A REVISAR
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

function verifyJWT(req, res, next) {
    const token = req.headers['x-acess-token'];
    if(!token)
        return res.status(401).json({auth: false, message: "Nenhum token de autenticação"});
    
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if(err) {
            return res.status(500).json({auth: false, message: "Falha ao autenticar"});
        }

        console.log(decoded);
        next();
    })
}