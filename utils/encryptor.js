/**
 * Encrypts a JSON payload given the private key
 * corresponding to the public key stored in Dashboard
 **/
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');


function encrypt(payload) {
    const privateKey = fs.readFileSync(path.join(__dirname, '../keys/privatekey.pem'), 'utf8');
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

module.exports = { encrypt };
