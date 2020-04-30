/*
 * Functions that interact with the JSON Editor component
 */

/*  prepopulateInitialPayload
 *
 *  It populates the JSON editor with a valid JSON payload
 *  based on the current storefront selected.
 *  If there are any products available in the storefront it will add
 *  the first one found in SBL to the payload.
*/ 
function prepopulateInitialPayload(data) {
    // Create initial payload
    const initialPayload = {
        contact: {
            email: 'myName@email.com',
            firstName: 'John',
            lastName: 'Doe'
        }
    };
    // Check if we can add an example product to the payload
    let productPath;
    for (var i = 0; i < data.groups.length; i++) {
        for (var j = 0; j < data.groups[i].items.length; j++) {
            productPath = data.groups[i].items[j].path;
            break;
        }
    }
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
    // Render payload in JSON editor
    renderJSONEditor(initialPayload);
    // Turn off variable to avoid executing this function in every data-data-callback
    storefrontInitialLoad = false;
}

/*  customizeJSONEditor
 *
 *  The default version of the editor comes with some extra buttons that aren't really
 *  needed in this application. This functions deletes them and changes the styles a bit
 *  to accommodate for a custom title
 */ 
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

/*  checkPayloadValidity
 *
 *  This function is hooked up to the 'onChange' callback of the JSONEditor component.
 *  Check common.js to see its initialization
 */ 
function checkPayloadValidity() {
    let isValid = true;
    try {
        JsonEditor.get();
    } catch (e) {
        isValid = false;
    }
    return isValid;
}

/*  renderJSONEditor
 *
 *  Util to render the new content in the editor
 */ 
function renderJSONEditor(payload) {
    JsonEditor.set(payload);
}
