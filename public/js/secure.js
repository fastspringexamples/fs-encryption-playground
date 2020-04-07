window.addEventListener('DOMContentLoaded', () => {
    const storefronts = document.getElementById('storefronts');
    const keysForm = document.getElementById('keys-form');
    const popupFormStorefront = document.getElementById('popupFormStorefront');
    

    /* When page loads make sure we create the Options available for the current storefront */
    if (localStorage.getItem('storefrontToUse')) {
        $('#storefrontId').val(localStorage.getItem('storefrontToUse'));
    }
    if (localStorage.getItem('accessKeyToUse')) {
        $('#accessKey').val(localStorage.getItem('accessKeyToUse'));
    }

    function addStorefront(storefront) {
        let storename = storefront;
        // Prettify storefront names for user
        if (storefront === 'fastspringexamplesii.test.onfastspring.com/popup-fastspringexamplesii') {
            storename = 'Example popup storefront';
        } else if (storefront === 'fastspringexamplesii.test.onfastspring.com') {
            storename = 'Example web storefront';
        }
        const option = $(`
            <div class="form-check">
               <input class="form-check-input" type="radio" name="radio-storefront" value="${storefront}">
               <label class="form-check-label" for="exampleRadios1">
                   ${storename}
               </label>
           </div>
        `);
        $('#storefronts').append(option);
    }

    config.storefronts.forEach(function(storefront) {
        addStorefront(storefront);
    });

    var currentStorefront = sessionStorage.getItem('FSsecure-storefrontToUse');
    if (currentStorefront && (config.storefronts.indexOf(currentStorefront) == -1)) {
        addStorefront(currentStorefront);
    }

    for (var i = 0; i < storefronts.elements.length; i++) {
        const val = storefronts.elements[i].value
        if (storefronts.elements[i].value === storefrontToUse) {
            storefronts.elements[i].checked = true;
        }
    }

    // Reload page with new storefront
    storefronts.addEventListener('change', function (event) {
        window.localStorage.setItem('storefrontToUse', event.target.value);
        window.location.reload();
    }, false);


    // Display steps if new storefront is chosen
    if (currentStorefront) {
        $('#createKeysModal').modal('show');
    }

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
                break;
            case 'existing-keys':
                nextStep = 'keys-form';
                break;
            case 'new-keys-form':
                nextStep = 'new-keys-result';
                break;
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
        const steps = ['initial', 'existing-keys', 'new-keys-form', 'new-keys-result'];
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


/*  setCustomStorefront
 *  Double check that the storefront added has a correct regex.
 *  Update localstorage and reload page so that the new storefront takes over.
 */
function setCustomStorefront() {
    if (popupFormStorefront.checkValidity()) {
        const storeFrontToUse = popupFormStorefront.storefrontId.value;
        const regex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(\/[a-z0-9-]*)?$/;
        if (!regex.test(storeFrontToUse)) {
            $('#error-storefrontId').removeClass('hidden');
            return false;
        }
        $('#updateStorefront').modal('hide');
        window.sessionStorage.setItem('FSsecure-storefrontToUse', storeFrontToUse.replace(/^https?:\/\//, ''));
        window.sessionStorage.setItem('FSsecure-accessKeyToUse', popupFormStorefront.accessKey.value);
        window.location.reload();
        return false;
    }
};


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
