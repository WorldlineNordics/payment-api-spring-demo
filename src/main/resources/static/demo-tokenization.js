// Acceptance demo - generated with request-generator tool
var deviceAPIRequest="{ \"version\": \"A\", \"deviceEndpoint\": \"https://device-api-test.payments.worldlinenordics.com/api/v1/payments\", \"encryptedPayload\": \"BgAAA-oAAAPrWCc6YUSpiv-skJwMkVgESg08nsfZJnymuzn9tXca7DfCJ2IpZNC7HaTJw6h3dimCBiyfSpqXq4gX7zyrKVGjSmqGDu_uK2PWJQ6q9mLehnzmMQprdtdezAUlh5ppbF43sJgcUjOmVcilBsSSL37zL1yrZoW9UKukQzY_hugiGR57ZGTmBFKhdfsn9qIoyDuHwZ5cKe8ka7rILq1RKKZvoCTd5HmNMFM-T2ANS-aHtOerO_a6R-SJVuQTzMH9o76DAgTkAtyzkCrTFAjSVaRH4Qe0LT0toXv4f5FiqCcYyUtn-Z6E6ajTVqXBIwsjXQmQp5MmpYooUvYW1FIiFKy4PWB4xBFOIlvXBXQ9z67mRnr_F_bgmtDe7w2talfN7B2ouBnErhcrC5Ss9XYa-VYYBg28T1hNOiBIKQtNUTw__XO4BNyr-L3ll10eoeUI4orAPIlnQ0zhvPJXMiwq45m8xj5wU3hnKu4s_GvL0X9KbpW2lsFsbRJ-0WHf2Ythv2n91P6ofvpTAAHXStprYwsLTlxYq8jTMFAtrnDse0NdVH1UUBnUHiV5RLy7Y4EMC6CItn1aITDsV8MOFUS5-Su-kntodtDJ866SzlRDxSYdArtQ0y4uy-eO-9AMCTiRtCgW9WcydM6lh9k9pCRmjyyaeNhNw5XIex4Hv0As-rFIMvy6k3-LT7Xg5L5xOnfUBZd1iptu2mELJKi_J6tu5-u0EnM0s4H0fd3rmxcYvQblPXB3oiZyExNufFZJ9gSwCb__FpURXkRi-b2f0S91WpZZpXbGPZZ8NKBSYvuR9ErrxOP6Y-GnPhsNwB5SWhcoexU7iyVFbK6CHT6gRrLmPG7eewHf8eSZAOm6F7GJIikS5qA=\"}";

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


        displayResult("Processing request with Worldline.", "");
        makeWLPromise(JSON.parse(deviceAPIRequest))
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