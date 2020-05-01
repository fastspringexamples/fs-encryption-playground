const express = require('express');

const encryptor = require('./utils/encryptor.js');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const port = 8000;

/* POST /encrypt
 * Processes order.completed FastSpring webhook to add buyer's account information
 * to database.
 *
 * @param {String} - custom session payload to encrypt
 * @param {String} - optional custom key in case user is testing its own storefront
 * @returns {Object} - encrypted payload
 */
app.post('/encrypt', (req, res) => {
    const payload = encryptor.encrypt(req.body, req.body.customKey);
    res.json(payload);
});

/* GET /keys/new
 * Open endpoint to get a pair of  RSA-2048 bits private key and a self-signed certificate
 *
 * @returns {Object} - encrypted payload
 */

app.get('/keys/new', async (req, res) => {
    const { privateKey, publicCrt } = await encryptor.createNewKeys();
    res.json({ success: true, keys: { privateKey, publicCrt } });
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));
