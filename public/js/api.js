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
        } else {
            alert('An error occurred, please try again');
            resetKeyCreationSteps();
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

    // Make sure key exists when using Wizard
    if (wizardOn) {
        const customKey = $('.privateKey > pre').html();
        if (!customKey) {
            alert('Private key not found, please review key creation step');
            return;
        }
        JSONPayload.customKey = customKey;
    }
    // Create AJAX request to our backend
    const Http = new XMLHttpRequest();
    const url= `${window.location.origin}/encrypt`;
    Http.open('POST', url, true);
    Http.setRequestHeader("Content-Type", "application/json");

    Http.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
        const resEncrypted = JSON.parse(this.responseText);
        if (resEncrypted.success) {
            let codeToExec = `
const securePayload = "${resEncrypted.payload.securePayload}";
const secureKey = "${resEncrypted.payload.secureKey}";

fastspring.builder.secure(securePayload, secureKey);`;
            // Check if the current payload contains products in it so that we can call the checkout funciton
            if (Array.isArray(JSONPayload.items) && JSONPayload.items.length > 0) {
                codeToExec = `${codeToExec}
fastspring.builder.checkout();`;
            }

            $('#encrypted-code').html(codeToExec);
        } else {
            alert('Problem encrypting payload');
        }
    } else if (this.readyState === 4 && this.status !== 200) {
        alert('Problem encrypting payload');
    }
    };
    Http.send(JSON.stringify(JSONPayload));
}
