const express = require('express');

const encryptor = require('./utils/encryptor.js');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const port = process.env.PORT || 9000;

/* POST /encrypt
 * Encrypts the custom payload found in the body of the request. If a customKey is provided,
 * it will be used for the encryption. Otherwise, it will default to the fastspringexamplessII store
 *
 * @param {String} - custom session payload to encrypt
 * @param {String} - optional custom key in case user is testing its own storefront
 * @returns {Object} - encrypted payload
 */
app.post('/encrypt', (req, res) => {
    try {
        const payload = encryptor.encrypt(req.body, req.body.customKey);
        res.json({ success: true, payload });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

/* GET /keys/new
 * Open endpoint to get a pair of  RSA-2048 bits private key and a self-signed certificate
 *
 * @returns {Object} - encrypted payload
 */
app.get('/keys/new', async (req, res) => {
    try {
        const { privateKey, publicCrt } = await encryptor.createNewKeys();
        res.json({ success: true, keys: { privateKey, publicCrt } });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));
