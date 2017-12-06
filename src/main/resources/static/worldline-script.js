
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
                success(JSON.parse(this.responseText).encResponse);
            }

            // Define what happens in case of error
            if (this.status === 400 || this.status === 401) {
                error(this.responseText);
            }

            if (this.status === 405) {
                error('Status : ' + this.status + ' ' + ', Please verify the Worldline API URL');
            }
        });

        xhttp.addEventListener("timeout", function () {
            error('Timeout while processing transaction.');
        });

        xhttp.open("POST", path, true);
        xhttp.timeout = 60000;
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(data);
    }

    var PaymentRequest = function () {
        var _theForm, _cardHolderName, _cardNumber, _expDateMonth, _expDateYear, _cvCode, _encryptedPayload, _path;
        var _success, _error;
        var _status;

        var _self = {
            cardHolderName: function (n) {
                _cardHolderName = n;
                return this
            },
            form: function (n) {
                _theForm = n;
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
            path: function (n) {
                _path = n;
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
            send: function() {
                _status = sendPayment(_success, _error, _encryptedPayload, _path, _cardHolderName, _cardNumber, _expDateMonth, _expDateYear, _cvCode);
            }

        };

        Object.defineProperty(_self, "status", {
            get: function () {
                return _status;
            }
        });

        return _self;
    };

    console.log("HEJ");
