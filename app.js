const express = require('express');
const util = require('util');

const encryptor = require('./utils/encryptor.js');


const app = express();
app.use(express.json());
app.use(express.static('public'));

const port = 9000;

app.post('/encrypt', (req, res) => {
    const payload = encryptor.encrypt(req.body, req.body.customKey);
    res.json(payload);
});


app.get('/keys/new', async (req, res) => {
    const { privateKey, publicCrt } = await encryptor.createNewKeys();
    res.json({ success: true, keys: { privateKey, publicCrt } });
});


app.post('*', (req, res) => {
    console.log(util.inspect(req.headers, false, null, true));
    res.sendStatus(200);
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));
