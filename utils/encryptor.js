/**
 * Encrypts a JSON payload given the private key
 * corresponding to the public key stored in Dashboard
 **/
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const NodeOpenssl = require('node-openssl-cert');

function createNewKeys() {
    const openssl = new NodeOpenssl();

    const rsakeyoptions = {
        rsa_keygen_bits: 2048,
        format: 'PKCS1'
    };

    const csroptions = {
        hash: 'sha512',
        subject: {
            organizationName: 'FastSpringExamples',
        }
    };

    return new Promise((resolve, reject) => {
        openssl.generateRSAPrivateKey(rsakeyoptions, function (err, privateKey, cmd) {
            openssl.generateCSR(csroptions, privateKey, null, function (err, csr, cmd) {
                if (err) {
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

// TODO add error handling
function encrypt(payload, customKey) {
    const privateKey = customKey || fs.readFileSync(path.join(__dirname, '../keys/privatekey.pem'), 'utf8');
    console.log(privateKey);
    const aesKey = crypto.randomBytes(16);
    const iv = '';
    const cipher = crypto.createCipheriv('aes-128-ecb', aesKey, iv);
    const buffer = Buffer.from(JSON.stringify(payload));
    const encryptedPayload = cipher.update(buffer, 'utf8', 'base64');
    const securePayload = encryptedPayload + cipher.final('base64');
    const secureKey = crypto.privateEncrypt(privateKey, aesKey).toString('base64');
    return {
        securePayload,
        secureKey
    };
}

module.exports = { encrypt, createNewKeys };
