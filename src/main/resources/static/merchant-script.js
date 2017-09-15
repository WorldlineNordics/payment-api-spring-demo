window.addEventListener("load", function () {
    function sendDataToMerchant() {
        var XHR = new XMLHttpRequest();

        // Bind the FormData object and the form element
        var FD = new FormData(form);

        // Define what happens on successful data submission
        XHR.addEventListener("load", function(event) {
            alert(event.target.responseText);
        });

        // Define what happens in case of error
        XHR.addEventListener("error", function(event) {
            alert('Oups! Something goes wrong.');
        });

        // Set up our request
        XHR.open("POST", "/api/users/registrations");

        // The data sent is what the user provided in the form
        XHR.send(FD);
    }

    // Access the form element...
    var form = document.getElementById("paymentForm");

    // ...and take over its submit event.
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        sendDataToMerchant();
        response = sendDataToMerchant();

        // Pick the chd elements from the form (card, cvv, expdate)

        // Call drwp-script.js method that calls Device REST API
        //sendPayment(card,cvv,expdate, response.encryptedPayload)
    });
});