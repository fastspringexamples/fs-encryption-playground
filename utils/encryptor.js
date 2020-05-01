/**
 * Encrypts a JSON payload given the private key
 * corresponding to the public key stored in Dashboard
 **/
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const NodeOpenssl = require('node-openssl-cert');

/*  createNewKeys
 *  It creates a pair of RSA-2048 bits private key and public certificate using OpenSSL.
 *  The public certificate is self-signed with just FastSpringExamples as organization name.
 *  This self-generated certificate only serves the purpose of estabilishing a secure connection between FastSpring
 *  and the vendor's site to create custom payloads. It is not meant to be used as an SSL certificate for your website
 *  since FastSpring is not a Certificate Authority.
 */
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
        openssl.generateRSAPrivateKey(rsakeyoptions, function (err, privateKey) {
            openssl.generateCSR(csroptions, privateKey, null, function (err, csr) {
                if (err) {
                    reject(err);
                } else {
                    openssl.selfSignCSR(csr, {}, privateKey, null, function(err, publicCrt) {
                        resolve({ privateKey, publicCrt });
                    });
                }
            });
        });
    });
}

/*  encrypt
 *  Util function to encrypt the given payload. If customKey is not provided it will use
 *  fastspringexamplesII encryption keys
 *
 *  @param {String} - custom session payload to encrypt
 *  @param {String} - optional custom key in case user is testing its own storefront
 *  @returns {Object} - encrypted payload
 */
function encrypt(payload, customKey) {
    const privateKey = customKey || fs.readFileSync(path.join(__dirname, '../keys/privatekey.pem'), 'utf8');
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
