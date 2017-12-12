// Decorate HTML expiry year select box.
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
        displayResult("Check if user registered and get encrypted request.","");
        exec();
    });

    function exec() {
        var FD = new FormData(form);

        makeRequest({
            method: 'POST',
            url: '/api/users/registrations',
            encode: false,
            params: FD
        })
            .then(function (response) {
                displayResult("Tokenization, fraud and compliancy screen, authorization and autocapture.", "");
                return makeWLPromise(response)
            })
            .then(function (response) {
                displayResult("Decrypting transaction result.", "");
                return makeRequest({
                    method: 'POST',
                    url: '/api/users/unpackResponse',
                    encode: true,
                    params: response
                });
            })
            .then(function(response) {
                response = JSON.parse(response);
                displayResult("Status: " + response.status
                    + "<br>TransactionId: " + response.transactionId
                    + "<br>OrderId: " + response.orderId
                    + "<br>Payment Method: " + response.paymentMethodName
                    , "");
            })
            .catch(function (err) {
                showError(err);
            });
    }
});


function showError(error) {
    console.error(error);
    displayResult("", "Error :" + error.status + ": " + error.statusText);
}

function displayResult(result, error) {
    document.getElementById("payment-result").innerHTML = result;
    document.getElementById("payment-errors").innerHTML = error;
}

function makeWLPromise(response) {
    return new Promise(function (resolve, reject) {
        new WLPaymentRequest()
            .card({
                cardHolderName: "John",
                cardNumber: "1234567890123456",
                cardExpiryMonth: "12",
                cardExpiryYear: "34",
                cvCode: "123"
            })
            .deviceAPIRequest(JSON.parse(JSON.parse(response).deviceAPIRequest))
            .onSuccess(resolve)
            .onError(reject)
            .send()
    })
}

function makeRequest(opts) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(opts.method, opts.url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText == '' ? 'Problems communicating with server.' : xhr.statusText
            });
        };

        var params = opts.params;

        if (params && typeof params === 'object' && opts.encode) {
            params = JSON.stringify(opts.params);
            xhr.setRequestHeader("Content-Type", "application/json");
        }
        xhr.send(params);
    });
}