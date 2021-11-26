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
    app.get('/user/authtoken/:token', (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");

        const token = req.params.token;
        clima.authToken(token, res);
    })
    app.post('/user/esp/vincular', verifyJWT, (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");

        const data = req.query;

        clima.vincularEsp(data, res, req.userid);
    })
    app.post('/user/esp/cultivo/vincular/', verifyJWT, (req, res, next) => {
        const data = req.query;

        clima.vincularCultivo(data, res);
    });
    app.delete('/user/esp/desvincular/', verifyJWT, (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        
        clima.desvincularEsp(req.query, res, req.userid);
    });
    app.get('/user/esp/getall/', verifyJWT, (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        
        clima.getAllESP(req.params, res, req.userid);
    });
    app.get('/user/esp/get/day/', (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");

        clima.getEspDay(req.query, res);
    });
    app.get('/user/esp/get/regallday', verifyJWT, (req, res, next) => {

        res.header("Access-Control-Allow-Origin", "*");

        clima.getRegAllDay(req.query, res, req.userid);
    })
    app.get('/cultivo/get/all', verifyJWT, (req, res, next) => {
        clima.getCultivos(res);
    })
    app.post('/inserirdados', (req, res, next) => { //OK REVISADO
        res.header("Access-Control-Allow-Origin", "*");
        const dados = req.body;

        clima.adicionar(dados, res);
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
    if(!token) {
        console.log(req.headers);           
        return res.status(401).json({auth: false, message: "Nenhum token de autenticação"});
    }
    
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if(err) {
            return res.status(500).json({auth: false, message: "Falha ao autenticar"});
        }

        req.userid = decoded.userid;
        next();
    })
}