/* 
 *  GLOBAL VARIABLES
 */
let JsonEditor = {};
let storefrontInitialLoad = true;
let changingStorefront = false;

function openKeysModal() {
    $("#createKeysModal").modal("show");
}

function openStorefrontModal() {
    $("#updateStorefrontModal").modal("show");
}

window.addEventListener('DOMContentLoaded', () => {
    const storefronts = document.getElementById('storefronts');
    const keysForm = document.getElementById('keys-form');
    const popupFormStorefront = document.getElementById('popupFormStorefront');

    $('#updateStorefrontModal').on('shown.bs.modal', function () {
        changingStorefront = true;
    });    

    document.getElementById('startWizard').onclick = startWizard;

    document.getElementById('resetWizard').onclick = startWizard;

    const createKeysBtn = document.getElementById('createKeysBtn');

    // Enable 'next' button once an option is selected
    keysForm.addEventListener('change', function (event) {
        $(createKeysBtn).removeAttr("disabled");
    }, false);


    createKeysBtn.setAttribute('data-step', 'initial');
    createKeysBtn.onclick = function () {
        const step = this.getAttribute('data-step');
        let nextStep;
        switch (step) {
            case 'initial':
                const radios = document.getElementsByName('radio-keys');
                for (var i = 0, length = radios.length; i < length; i++) {
                    if (radios[i].checked) {
                        nextStep = radios[i].value;
                        // only one radio can be logically checked, don't check the rest
                        break;
                    }
                }
                if (nextStep === 'new-keys-result') {
                    getNewKeys();
                }
                break;
            case 'existing-keys':
                // Check that key has been provided
                nextStep = step;
                if (setCustomPrivateKey()) {
                    $('#createKeysModal').modal('hide');
                }
                break;
            case 'new-keys-result':
                nextStep = step;
                $('#createKeysModal').modal('hide');
                break;
            default:
                nextStep = 'initial';
                break;
        }

        displayStep(nextStep);
        this.setAttribute('data-step', nextStep);
    };

    // Render JSON editor
    const container = document.getElementById("jsoneditor");
    const options = {
        mode: 'code',
        onError: function (err) {
            alert(err.toString());
        },
        onChange: function () {
            const valid = checkPayloadValidity();
            if (!valid) {
                $('#encryptButton').attr("disabled", true);
            } else {
                $('#encryptButton').removeAttr("disabled");
            }
        }
    };
    
    JsonEditor = new JSONEditor(container, options);
    
    // Customize the JSON editor menu
    customizeJSONEditor();

    // Make tooltips work
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });

    /* Prevent default submit on forms when pressing Enter key */
    $('form input').keydown(function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});

function setCustomPrivateKey() {
    const privateKey = document.getElementById('custom-key-form')['custom-privateKey'].value;
    if (!privateKey) {
        alert('Please input a private key');
        return false;
    }
    // Add private key to DOM element where the API gets the value from
    $('.privateKey').html(`<pre>${privateKey}</pre>`);
    // Check checklist step
    $('#keys-checked').prop('checked', true);
    return true;
}

function displayStep(currentStep) {
    const steps = ['initial', 'existing-keys', 'new-keys-result'];
    steps.forEach((step) => {
        const stepContainer = $(`#${step}-container`);
        if (step !== currentStep) {
            stepContainer.fadeOut();
        } else {
            stepContainer.fadeIn();
        }
    });
}

function resetKeyCreationSteps() {
    document.getElementById('createKeysBtn').setAttribute('data-step', 'initial');
    document.getElementById('createKeysBtn').setAttribute('disabled', 'true');
    const radios = document.getElementsByName('radio-keys');
    for (var i = 0, length = radios.length; i < length; i++) {
        radios[i].checked = false;
    }
    displayStep('initial');

    // Remove any existing keys
    document.getElementById('custom-key-form')['custom-privateKey'].value = '';
    $('.privateKey').html('');
    $('.publicKey').html('');
}

// Start wizard from beginning
function startWizard() {
    $('#instructions-container').hide();
    $('#wizard-checklist-container').show();
    
    // Uncheck steps
    $('#storefront-checked').prop('checked', false);
    $('#keys-checked').prop('checked', false);
    emptyExecutionCode();
    deleteCurrentStorefront();
    renderJSONEditor({});
    resetKeyCreationSteps();
    storefrontInitialLoad = true;
    openStorefrontModal();
}

function emptyExecutionCode() {
    $("#encrypted-code").html('');
}

/*
 *  API
 **/
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
 *  Double check that the storefront added has a correct regex.
 *  Update localstorage and reload page so that the new storefront takes over.
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


function secureCall() {
    eval($("#encrypted-code").html());
}

/*
 * JSON Editor
 */

// It populates the JSON editor with a valid JSON payload
// based on the current storefront selected.
// If there are any products available in the storefront it will add
// the first one found in SBL to the payload.
function prepopulateInitialPayload(data) {
    let productPath;
    for (var i = 0; i < data.groups.length; i++) {
        for (var j = 0; j < data.groups[i].items.length; j++) {
            productPath = data.groups[i].items[j].path;
            break;
        }
    }
    const initialPayload = {
        contact: {
            email: 'myName@email.com',
            firstName: 'John',
            lastName: 'Doe'
        }
    };
    if (productPath) {
        initialPayload.items = [
            {
                product: productPath,
                quantity: 1,
                pricing: {
                    price: {
                        USD: 20.00
                    }
                }
            }
        ];
    }
    renderJSONEditor(initialPayload);
    // Turn off variable to avoid executing this function in
    // every data-data-callback
    storefrontInitialLoad = false;
}

function customizeJSONEditor() {
    // Remove unneeded buttons
    $('.jsoneditor-repair').remove();
    $('.jsoneditor-transform').remove();
    $('.jsoneditor-sort').remove();

    // Swap children and push them to the right
    const editorElement = $('.jsoneditor-menu');
    const children = editorElement.children();
    children.sort((() => -1 ));
    $('.jsoneditor-menu').empty();
    children.appendTo(editorElement);
    // Insert title
    const editorTitle = '<p class="editor-title"> Custom JSON Payload </p>';
    editorElement.prepend(editorTitle);
}

function checkPayloadValidity() {
    let isValid = true;
    try {
        JsonEditor.get();
    } catch (e) {
        isValid = false;
    }
    return isValid;
}

function renderJSONEditor(payload) {
    JsonEditor.set(payload);
}

/*
 * SBL
 */
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

function dataErrorCallback(code, string) {
    if (code === 0) {
        $('#incorrect-storefront').show();
        document.getElementById('popupFormStorefront').classList.remove('was-validated');
        $('#storefrontId').addClass('is-invalid');
        deleteCurrentStorefront();
        $('#storefront-checked').prop("checked", false);
        storefrontInitialLoad = true;
    } else if (code === 400 && string === "Invalid Payload") {
        alert('Invalid payload');
    }
}

/*
 * JQuery miscellaneous functions
 */

// Example starter JavaScript for disabling form submissions if there are invalid fields
(function() {
    'use strict';
    window.addEventListener('load', function() {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function(form) {
            form.addEventListener('submit', function(event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();

function copyToClipboard(key) {
    /* Get the text field */
    const copyText = $(`.${key} > pre`).html();
    const fallbackCopyTextToClipboard = () => {
        console.log(copyText);
        var textArea = document.createElement("textarea");
        textArea.value = copyText;

        // Avoid scrolling to bottom
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999);
        document.body.removeChild(textArea);
        try {
            document.execCommand('copy');
        } catch (err) {
            alert('Unable to copy. Your browser does not support copy-to-clipboard functionality.',
                'Please select key and save its content manually');
        }
    };

    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(copyText);
        return;
    }
    navigator.clipboard.writeText(copyText).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}
