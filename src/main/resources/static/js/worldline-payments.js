/**
 * @file
 * Provides Worldline Payment API.
 *
 * Usage:
 * var Request = new WLPaymentRequest()
 *      .chdForm(document.getElementById("paymentForm"), 'data-chd')
 *      .deviceAPIRequest(deviceAPIRequest)
 *      .onSuccess(callback)
 *      .onError(callback)
 *      .send();
 *
 *  Where
 *  - The form has input fields for cardNumber, cardExpiryMonth, cardExpiryYear, cardCVC.
 *    Note that the form input fields may not have "name", as that could risk that the cardholderdata gets
 *    passed to the merchant server. This method explicitly warns on the console in that case.
 *  - The deviceAPIRequest contains a JSON with encryptedPayload and deviceEndpoint.
 *  - Callbacks for success and error. Error callback provides a JSON with status and statusText.
 *    The success callback contains an encryptedResponse that requires decryption on server side.
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
    var _cardHolderName, _cardNumber, _expDateMonth, _expDateYear, _cvCode, _encryptedPayload, _endpoint;
    var _success, _error;
    var _state = WLPaymentRequestState.NEW;

    var _self = {
        cardHolderName: function (n) {
            _cardHolderName = n;
            return this
        },
        chdForm: function (document, tag) {
            if (tag && document && typeof document === 'object') {
                var chdElements = document.querySelectorAll('['+tag+']');
                var chd = {};
                chdElements.forEach(function (x) {
                    chd[x.attributes["data-chd"].nodeValue] = x.value;

                    if (x.hasAttribute("name")) {
                        console.warn("Form compliancy warning: input field " + x.attributes[tag].nodeValue + " has 'name' attribute");
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
        card: function(n) {
            if ("cardNumber" in n) _cardNumber = n.cardNumber;
            if ("cardHolderName" in n) _cardHolderName = n.cardHolderName;
            if ("expDateMonth" in n) _expDateMonth = n.cardExpiryMonth;
            if ("expDateYear" in n) _expDateYear = n.cardExpiryYear;
            if ("cvCode" in n) _cvCode = n.cardCVC;
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
        deviceAPIRequest: function (n) {
          _encryptedPayload = n.encryptedPayload;
          _endpoint = n.deviceEndpoint;
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
        	var data = JSON.stringify({
	            cardHolderName: _cardHolderName,
	            cardNumber: _cardNumber,
	            expDateMonth: _expDateMonth,
	            expDateYear: _expDateYear,
	            cvCode: _cvCode,
	            encryptedPayload: _encryptedPayload
	        });
        	WLProcessRequest(_success, _error, _endpoint,data);
            return this
        }
    };

    Object.defineProperty(_self, "state", {
        get: function () {
            return _state;
        }
    });

    return _self;
};

var WLRedirectPaymentRequest = function () {
    var _encryptedPayload, _endpoint,_paymentMethodId;
    var _success, _error;
    var _state = WLPaymentRequestState.NEW;

    var _self = {
        deviceAPIRequest: function (n) {
          _encryptedPayload = n.encryptedPayload;
          _endpoint = n.deviceEndpoint;
          return this
        },
        ibpForm:function(document,tag){
        	if (tag && document && typeof document === 'object'){
        		var el = document.querySelector('['+tag+']');
        		_paymentMethodId =  el.value;
        	}
        	return this;
        },
        paymentMethodId: function (n) {
        	_paymentMethodId = n;
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
        	var data = JSON.stringify({
            		paymentMethodId:_paymentMethodId,
            		encryptedPayload:_encryptedPayload
            	});
        	WLProcessRequest(_success, _error, _endpoint,data);
            return this
        }
    };

    Object.defineProperty(_self, "state", {
        get: function () {
            return _state;
        }
    });

    return _self;
};

var WLPaymentMethodRequest = function () {
    var _encryptedPayload, _endpoint,_paymentMethodType;
    var _success, _error;
    var _state = WLPaymentRequestState.NEW;

    var _self = {
        deviceAPIRequest: function (n) {
          _encryptedPayload = n.encryptedPayload;
          _endpoint = n.deviceEndpoint;
          return this
        },
        pmType: function (n) {
        	_paymentMethodType = n;
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
        	var data = JSON.stringify({
            		paymentMethodType:_paymentMethodType,
            		encryptedPayload:_encryptedPayload
            	});
        	WLProcessRequest(_success, _error, _endpoint,data);
            return this
        }
    };

    Object.defineProperty(_self, "state", {
        get: function () {
            return _state;
        }
    });

    return _self;
};


var WLProcessRequest = function(success, error,endpoint,data){
	var xhttp = new XMLHttpRequest();

    xhttp.open("POST", endpoint, true);
    xhttp.timeout = 60000;
    xhttp.setRequestHeader("Content-type", "application/json");

    xhttp.onload = function () {
        if (this.status >= 200 && this.status < 300) {
            _state = WLPaymentRequestState.OK;
            success(JSON.parse(xhttp.response));
        } else if (this.status === 405) {
            _state = WLPaymentRequestState.ERROR;
            error({
                status: this.status,
                statusText: 'Please verify the Worldline Device API URL'
            });
        } else {
            _state = WLPaymentRequestState.ERROR;
            error({
                status: this.status,
                statusText: xhttp.statusText
            });
        }
    };
    xhttp.onerror = function () {
        _state = WLPaymentRequestState.ERROR;
        error({
            status: this.status,
            statusText: xhttp.statusText === '' ? 'Could not send transaction.' : xhttp.statusText
        });
    };
    xhttp.ontimeout = function () {
        _state = WLPaymentRequestState.ERROR;
        error({
            status: this.status,
            statusText: xhttp.statusText
        });

    };

    _state = WLPaymentRequestState.SENT;
    xhttp.send(data);
	
}