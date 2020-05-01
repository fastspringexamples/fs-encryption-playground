/* 
 *  Global variables and utils used by the rest of js modules to interact with the frontend
 */


/* 
 *  GLOBAL VARIABLES
 */
let JsonEditor = {};
let storefrontInitialLoad = true;
let changingStorefront = false;
let wizardOn = false;

/* 
 *  Common utils
 */
function openKeysModal() {
    $("#createKeysModal").modal("show");
}

function openStorefrontModal() {
    $("#updateStorefrontModal").modal("show");
}

function emptyExecutionCode() {
    $("#encrypted-code").html('');
}

function secureCall() {
    eval($("#encrypted-code").html());
}

/* 
 *  WIZARD FUNCTIONS
 */

/*  keysModalStateMachine
 *
 *  This function controls the steps inside the key creation modal
 */
function keysModalStateMachine() {
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
}

/*  setCustomPrivateKey
 *
 *  If user adds its own key, this function will place it in the field
 *  where the /encrypt API call expects the value to be 
 */
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

/*  displayStep
 *
 *  Util used by the keysModalStateMachine to display the appropiate step
 *
 *  @param {String} - currentStep. One of ['initial', 'existing-keys', 'new-keys-result']
 */
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

/*  resetKeyCreationSteps
 *
 *  Resets the keysModalStateMachine
 *
 */
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

/*  startWizard
 *
 *  Starts wizard from the beginning. Also used by restart function.
 *
 */
function startWizard() {
    wizardOn = true;
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
    // Edit error modal
    $('#default-product-paths').hide();
    $('.wizard-on-errors').show();
    // Open up storefront modal
    openStorefrontModal();
}

/*  copyToClipboard
 *
 *  Util to copy the generated pair of keys into the clipboard
 *
 */
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

window.addEventListener('DOMContentLoaded', () => {
    const keysForm = document.getElementById('keys-form');

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
    createKeysBtn.onclick = keysModalStateMachine;

    // Initial render of the JSON editor
    const container = document.getElementById('jsoneditor');
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
