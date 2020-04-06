const express = require('express');
const util = require('util');
const path = require('path');
const crypto = require('crypto');
const node_openssl = require('node-openssl-cert');

const openssl = new node_openssl();

const fs = require('fs');
const pem = require('pem');

const privateKeyPath = path.resolve(__dirname, 'keys/privatekey.pem');
const publicCertPath = path.resolve(__dirname, 'keys/publiccert.crt');

// TODO migrate to util function and make csr options dynamic
function createNewKeys() {
    var rsakeyoptions = {
        rsa_keygen_bits: 2048,
        format: 'PKCS1'
    };

    var csroptions = {
        hash: 'sha512',
        subject: {
            countryName: 'US',
            stateOrProvinceName: 'Louisiana',
            localityName: 'Slidell',
            postalCode: '70458',
            streetAddress: '1001 Gause Blvd.',
            organizationName: 'SMH',
            organizationalUnitName: 'IT',
            commonName: [
                'certificatetools.com',
                'www.certificatetools.com'
            ],
            emailAddress: 'lyas.spiehler@slidellmemorial.org'
        }
    }

    
    return new Promise((resolve, reject) => {
        openssl.generateRSAPrivateKey(rsakeyoptions, function(err, privateKey, cmd) {
            openssl.generateCSR(csroptions, privateKey, null, function(err, csr, cmd) {
                if(err) {
                    reject(err);
                } else {
                    openssl.selfSignCSR(csr, {}, privateKey, null, function(err, publicCrt, cmd) {
                        resolve({ privateKey, publicCrt });
                    });
                }
            });
        });
    });
}


const encryptor = require('./utils/encryptor.js');


const app = express();
app.use(express.json());
app.use(express.static('public'));

const port = 9000;

/**
 * Validates a FastSpring webhook
 * https://fastspring.com/docs/webhooks#messageSecret
 *
 * @param {string} req    Node request object, where 'req.body' is a Node
 *                        Buffer object containing the request body
 * @param {string} secret the secret string saved in Dashboard
 */
const isValidSignature = (req, secret) => {
    const fsSignature = req.headers['x-fs-signature'];
    console.log(req.body);
    const computedSignature = crypto.createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest()
        .toString('base64');
    console.log(computedSignature, fsSignature, fsSignature === computedSignature);
    return fsSignature === computedSignature;
}



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
    const { privateKey, publicCrt } = await createNewKeys();
    res.json({ privateKey, publicCrt });
});


app.post('*', (req, res) => {
    console.log(req.headers);
    console.log(util.inspect(req.headers, false, null, true));
    res.sendStatus(200);
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));
