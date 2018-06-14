
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

    // Prevent form from being submitted
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        exec();
    });

    function exec() {
        var formAsJson = formToJson(form);

        makeRequest({
            method: 'POST',
            url: '/api/demo/registrations',
            encode: false,
            params: formAsJson
        })
        .then(function (response) {
            displayResult("Processing with Worldline.", "");
            return makeWLPromise(JSON.parse(JSON.parse(response).deviceAPIRequest))
        })
        .then(function (response) {
                displayResult("Processing result with merchant.", "");
                return makeRequest({
                    method: 'POST',
                    url: '/api/demo/unpackResponse',
                    encode: true,
                    params: JSON.stringify(response)
                });
            })
            .then(function (response) {
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

function makeWLPromise(data) {
    return new Promise(function (resolve, reject) {
        new WLPaymentRequest()
            .chdForm(document.getElementById("paymentForm"), 'data-chd')
            .deviceAPIRequest(data)
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

        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(opts.params);
    });
}

function formToJson(form) {
    var FD = new FormData(form);
    var object = {};
    FD.forEach(function (value, key) {
        object[key] = value;
    });
    return JSON.stringify(object);
}