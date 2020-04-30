/*
 *  Functions to interact with the API
 */

/*  getNewKeys
 *
 *  This function is called during the key definition step of the Wizard.
 *  It gets a new pair keys (private key and a public certicate) from the backend
 *  and adds it to the keys modal so that the user can copy them 
 */ 
function getNewKeys() {
    $.get('/keys/new').done(function(resKey) {
        if (resKey && resKey.success) {
            $('.privateKey').html(`<pre>${resKey.keys.privateKey}</pre>`);
            $('.publicKey').html(`<pre>${resKey.keys.publicCrt}</pre>`);
            // Mark step as marked
            $('#keys-checked').prop('checked', true);
        }
    });
}

/*  encryptPayload
 *
 *  Reads the raw payload from JSON editor component and the current key and
 *  sends it to the backend for encryption.
 *  If Wizard is open, it will get the defined key. If the Wizard is not open the backend will assume that it
 *  needs to use the default fastspringexamples key.
 *  If the encryption was successful, it will populate the secure method with the
 *  encrypted payload and the secure key from the response.
 */ 
function encryptPayload() {
    // Check that there is a valid payload
    const fscAPi = document.getElementById('fsc-api');
    if (!fscAPi) {
        alert('Please insert a valid storefront');
        $('#updateStorefrontModal').modal('show');
        return;
    }
    const JSONPayload = JsonEditor.get();

    // Create AJAX request to our backend
    JSONPayload.customKey = $('.privateKey > pre').html();
    // TODO make sure key exists when using Wizard
    const Http = new XMLHttpRequest();
    const url= `${window.location.origin}/encrypt`;
    Http.open('POST', url, true);
    Http.setRequestHeader("Content-Type", "application/json");

    Http.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
        const resEncrypted = JSON.parse(this.responseText);
        $('#encrypted-code').html(`
const securePayload = "${resEncrypted.securePayload}";
const secureKey = "${resEncrypted.secureKey}";

fastspring.builder.secure(securePayload, secureKey);
fastspring.builder.checkout();`);
        }
    };
    Http.send(JSON.stringify(JSONPayload));
}
