const express = require('express');
const util = require('util');
const path = require('path');


const fs = require('fs');

const privateKeyPath = path.resolve(__dirname, 'keys/privatekey.pem');
const publicCertPath = path.resolve(__dirname, 'keys/publiccert.crt');


const encryptor = require('./utils/encryptor.js');


const app = express();
app.use(express.json());
app.use(express.static('public'));

const port = 9000;


app.post('/encrypt', (req, res) => {
    console.log(util.inspect(req.body, false, null, true));
    const payload = encryptor.encrypt(req.body);
    console.log(payload);
    res.json(payload);
});


app.get('/keys', (req, res) => {
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    const publicCrt = fs.readFileSync(publicCertPath, 'utf8');

    res.json({ privateKey, publicCrt });
});

app.post('/keys/new', async (req, res) => {
    const { privateKey, publicCrt } = await encryptor.createNewKeys();
    res.json({ privateKey, publicCrt });
});


app.post('*', (req, res) => {
    console.log(util.inspect(req.headers, false, null, true));
    res.sendStatus(200);
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));
