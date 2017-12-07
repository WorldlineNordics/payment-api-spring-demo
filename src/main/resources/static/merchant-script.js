
var year = (new Date()).getFullYear(), selectExp = document.getElementById("expYear"), option = null, next_year = null;

for (var i = 0; i <= 10; i++) {
    option = document.createElement("option");
    next_year = parseInt(year, 10) + i;
    option.value = next_year;
    option.innerHTML = next_year;
    selectExp.appendChild(option);
}

window.addEventListener("load", function () {
    var form = document.getElementById("paymentForm");

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        console.log("Sending form to merchant for registration, acquiring endpoint and encrypted data.");
        displayResult('Registering...', '');
        sendDataToMerchant();
    });

    function sendDataToMerchant() {
//        var XHR = new XMLHttpRequest();
        var XHR = createRequest();

        // Bind the FormData object and the form element
        // FIXME: EXSPRING-23
        var FD = new FormData(form);

        // Define what happens on successful data submission

        XHR.addEventListener("load", function () {
            if (this.readyState === 4 && this.status === 200) {
                var response = JSON.parse(this.responseText);

                console.log("Sending Payment Request to Worldline");

                var req = new WLPaymentRequest()
                    .chdForm(document.getElementById("paymentForm"), 'data-chd')
                    .encryptedPayload(response.encryptedPayload)
                    .endpoint(response.path)
                    .onSuccess(sendResultToUnpack)
                    .onError(showError)
                    .send();

                console.log("PaymentRequest state: " + WLPaymentRequestState.properties[req.state].name);
                displayResult("Request " + WLPaymentRequestState.properties[req.state].name, "");
            }
        });

        // Define what happens in case of error
        XHR.addEventListener("error", function () {
            displayResult('', 'Status :' + this.status + '. ' + this.statusText);
        });

        // Set up our request
        XHR.open("POST", "/api/users/registrations");

        // The data sent is what the user provided in the form
        console.log("Sending Request to Merchant Server application");
        XHR.send(FD);
    }

});

function sendResultToUnpack(transactionResult) {
    var xhttp = new XMLHttpRequest();

    // Define what happens when response recieved successfully
    xhttp.addEventListener("load", function () {
        if (this.readyState === 4 && this.status === 200) {
            var res = JSON.parse(this.responseText);
            console.log(res);
            displayResult("Status : "+ res.status+"<br>TransactionId : " + res.transactionId+"<br>OrderId : " + res.orderId, "");
       }
   });

    // Define what happens in case of error
    xhttp.addEventListener("error", function () {
        displayResult("", 'Status: ' + this.status + '<br>' + this.statusText);
    });

    // Set up our request
    xhttp.open("POST", "/api/users/unpackResponse");

    console.log("Sending Payment Processing Result to Merchant server.");
    // The data sent is what the user provided in the form
    xhttp.send(transactionResult);
}

function createRequest() {
    var request;
    if (window.XMLHttpRequest) { // Mozilla, Safari, ...
        request = new XMLHttpRequest();
    } else if (window.ActiveXObject) { // IE
        try {
            request = new ActiveXObject('Msxml2.XMLHTTP');
        }
        catch (e) {
            try {
                request = new ActiveXObject('Microsoft.XMLHTTP');
            }
            catch (e) {
            }
        }
    }
    return request;
}

function showError(error) {
    console.log("Merchant Server returned error.");
    displayResult("", "Error :" + error);
}

function displayResult(result, error) {
    document.getElementById("payment-result").innerHTML = result;
    document.getElementById("payment-errors").innerHTML = error;
}