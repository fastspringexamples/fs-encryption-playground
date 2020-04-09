let changingStorefront;

window.addEventListener('DOMContentLoaded', () => {
    const storefronts = document.getElementById('storefronts');
    const keysForm = document.getElementById('keys-form');
    
    $('#updateStorefront').on('shown.bs.modal', function () {
        console.log('eee!');
        changingStorefront = true;
    });

    $('#updateStorefront').modal('show');

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
                        // do whatever you want with the checked radio
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
                nextStep = 'keys-form';
                break;
                /*case 'new-keys-form':
                nextStep = 'new-keys-result';
                break;*/
            case 'new-keys-result':
                $('#createKeysModal').modal('hide');
                break;
            default:
                nextStep = 'initial';
                break;
        }

        displayStep(nextStep);
        this.setAttribute('data-step', nextStep);
    };

    function displayStep(currentStep) {
        console.log('EE', currentStep);
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
        displayStep('initial');
        createKeysBtn.setAttribute('initial');
    }
});


function getNewKeys() {
    $.get('/keys/new').done(function(resKey) {
        console.log('HHH', resKey);
        if (resKey && resKey.success) {
            console.log('jejje');
            $('.privateKey').html(`<pre> ${resKey.keys.privateKey} </pre>`);
            $('.publicKey').html(`<pre> ${resKey.keys.publicCrt} </pre>`);
        }
    });
}

/*  setCustomStorefront
 *  Double check that the storefront added has a correct regex.
 *  Update localstorage and reload page so that the new storefront takes over.
 */
function setCustomStorefront() {
    const popupFormStorefront = document.getElementById('popupFormStorefront');
    if (popupFormStorefront.checkValidity()) {
        const storeFrontToUse = popupFormStorefront.storefrontId.value;
        const regex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(\/[a-z0-9-]*)?$/;
        if (!regex.test(storeFrontToUse)) {
            $('#error-storefrontId').removeClass('hidden');
            return false;
        }

        const element = document.getElementById('fsc-api');
        if (element) {
            element.parentNode.removeChild(element);
            delete document.fastspring;
        }

        const script = document.createElement('script');
        script.onload = function () {
            console.log('storefront loaded');
        };
        script.id = 'fsc-api';
        script.setAttribute('data-storefront', storeFrontToUse);
        script.setAttribute('data-error-callback', 'dataErrorCallback2');
        script.setAttribute('data-data-callback', 'dataCallback');
        script.src = 'https://d1f8f9xcsvx3ha.cloudfront.net/sbl/0.8.0/fastspring-builder.min.js';
        document.head.appendChild(script);
        return false;
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

$("form").on('submit',function(e){
    e.preventDefault();
});
