/*
 *  Functions to interact with the Store Builder Library
 */

// See https://fastspringexamples.com/callback/data-data-callback/
function dataCallback(data) {
    // If this is the first time the selected storefront is loaded
    // pre-populate the JSON editor with a valid payload
    if (storefrontInitialLoad) {
        prepopulateInitialPayload(data);
    }

    if (changingStorefront) {
        $('#goToKeysForm').removeAttr("disabled");
        $('#storefront-checked').prop("checked", true);
        $('#updateStorefrontModal').modal('hide');
        $('#createKeysModal').modal('show');
    }
}

// See https://fastspringexamples.com/callback/data-error-callback
function dataErrorCallback(code, string) {
    if (code === 0) {
        $('#incorrect-storefront').show();
        document.getElementById('popupFormStorefront').classList.remove('was-validated');
        $('#storefrontId').addClass('is-invalid');
        deleteCurrentStorefront();
        $('#storefront-checked').prop("checked", false);
        storefrontInitialLoad = true;
    } else if (code === 400) {
        $('#payloadErrorModal').modal('show');
        // TODO add string when availble && string === "Invalid Payload");
    }
}

/*  deleteCurrentStorefront
 *
 *  Delete SBL from the current browser session
 */
function deleteCurrentStorefront() {
    const fscScript = document.getElementById('fsc-api');
    if (fscScript) {
        // Remove script from DOM
        fscScript.parentNode.removeChild(fscScript);
        // Delete fastspring builder from memory
        delete document.fastspring;
    }
}

/*  setCustomStorefront
 *
 *  It gets the new storefront and data-acces-keys values from the form.
 *  After double checking that the storefront added has a correct regex it will
 *  remove the current SBL installation and attempt to load the new storefront.
 */
function setCustomStorefront() {
    const popupFormStorefront = document.getElementById('popupFormStorefront');
    if (popupFormStorefront.checkValidity()) {

        const storeFrontToUse = popupFormStorefront.storefrontId.value;
        const accessKeyToUse = popupFormStorefront.accessKey.value;
        const regex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(\/[a-z0-9-]*)?$/;
        if (!regex.test(storeFrontToUse)) {
            $('#error-storefrontId').removeClass('hidden');
            return false;
        }
        // Check if there is a storefront already loaded on the page and delete it
        deleteCurrentStorefront();
        // Remove error styles if user previously tried to load an invalid storefront
        $('#storefrontId').removeClass('is-invalid');
        $('#incorrect-storefront').hide();

        const script = document.createElement('script');
        script.onload = function () {
            console.log('storefront loaded');
        };
        script.id = 'fsc-api';
        script.setAttribute('data-storefront', storeFrontToUse);
        script.setAttribute('data-access-key', accessKeyToUse);
        script.setAttribute('data-error-callback', 'dataErrorCallback');
        script.setAttribute('data-data-callback', 'dataCallback');
        script.setAttribute('data-popup-closed', 'dataPopupClosed');
        script.src = 'https://d1f8f9xcsvx3ha.cloudfront.net/sbl/0.8.0/fastspring-builder.min.js';
        document.head.appendChild(script);
        return false;
    }
}
