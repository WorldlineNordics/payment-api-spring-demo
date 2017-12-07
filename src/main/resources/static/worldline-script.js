/**
 * @file
 * Provides Worldline Payment API.
 *
 * Usage:
 * var Request = new WLPaymentRequest()
 *      .chdForm(document.getElementById("paymentForm"), 'data-chd')
 *      .encryptedPayload(encryptedPayload)
 *      .endpoint(URL)
 *      .onSuccess(callback)
 *      .onError(callback)
 *      .send();
 */

var WLPaymentRequestState = {
    NEW: 1,
    SENT: 2,
    OK: 3,
    ERROR: 4,
    properties: {
        1: {name: "NEW", value: 1},
        2: {name: "SENT", value: 2},
        3: {name: "OK", value: 3},
        4: {name: "ERROR", value: 4}
    }
};

var WLPaymentRequest = function () {
    var _theForm, _cardHolderName, _cardNumber, _expDateMonth, _expDateYear, _cvCode, _encryptedPayload, _endpoint;
    var _success, _error;
    var _state = WLPaymentRequestState.NEW;

    var _self = {
        cardHolderName: function (n) {
            _cardHolderName = n;
            return this
        },
        chdForm: function (document, tag) {
            _theForm = document;
            if (typeof document === 'object') {
                var chdElements = document.querySelectorAll('['+tag+']');
                var chd = {};
                chdElements.forEach(function (x) {
                    chd[x.attributes["data-chd"].nodeValue] = x.value;

                    if (hasName = x.hasAttribute("name")) {
                        console.error("PCI Compliancy warning: input field " + x.attributes["data-chd"].nodeValue + " has 'name' attribute");
                    }
                });
                _cardHolderName = chd["cardHolderName"];
                _cardNumber = chd["cardNumber"];
                _expDateMonth = chd["cardExpiryMonth"];
                _expDateYear = chd["cardExpiryYear"];
                _cvCode = chd["cardCVC"];
            }
            return this
        },
        cardNumber: function (n) {
            _cardNumber = n;
            return this
        },
        expDateMonth: function (n) {
            _expDateMonth = n;
            return this
        },
        expDateYear: function (n) {
            _expDateYear = n;
            return this
        },
        cvCode: function (n) {
            _cvCode = n;
            return this
        },
        encryptedPayload: function (n) {
            _encryptedPayload = n;
            return this
        },
        endpoint: function (n) {
            _endpoint = n;
            return this
        },
        onSuccess: function (n) {
            _success = n;
            return this
        },
        onError: function (n) {
            _error = n;
            return this
        },
        send: function () {
            sendPayment(_success, _error, _encryptedPayload, _endpoint, _cardHolderName, _cardNumber, _expDateMonth, _expDateYear, _cvCode);
            return this
        }
    };

    Object.defineProperty(_self, "state", {
        get: function () {
            return _state;
        }
    });

    function sendPayment(success, error, encryptedPayload, path, cardHolderName, cardNumber, expDateMonth, expDateYear, cvCode) {

        var xhttp = new XMLHttpRequest();

        var data = JSON.stringify({
            cardHolderName: cardHolderName,
            cardNumber: cardNumber,
            expDateMonth: expDateMonth,
            expDateYear: expDateYear,
            cvCode: cvCode,
            encryptedPayload: encryptedPayload
        });

        xhttp.addEventListener("load", function () {
            if (this.readyState === 4 && this.status === 201) {
                _state = WLPaymentRequestState.OK;
                success(JSON.parse(this.responseText).encResponse);
            }

            if (this.status === 400 || this.status === 401) {
                _state = WLPaymentRequestState.ERROR;
                error(this.responseText);
            }

            if (this.status === 405) {
                _state = WLPaymentRequestState.ERROR;
                error('Status : ' + this.status + ' ' + ', Please verify the Worldline API URL');
            }
        });

        xhttp.addEventListener("timeout", function () {
            _state = WLPaymentRequestState.ERROR;
            error('Timeout while processing transaction.');
        });

        xhttp.open("POST", path, true);
        xhttp.timeout = 60000;
        xhttp.setRequestHeader("Content-type", "application/json");
        _state = WLPaymentRequestState.SENT;
        xhttp.send(data);
    }

    return _self;
};

