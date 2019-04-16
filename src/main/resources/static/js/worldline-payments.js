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
 *
 *
 * Usage for VisaCheckout:
 * var Request = new WLPaymentRequest()
 *      .storedUserReference(storedUserReference)
 *      .deviceAPIRequest(deviceAPIRequest)
 *      .onSuccess(callback)
 *      .onError(callback)
 *      .send();
 *
 *  Where
 *  - The reference Id contains the call id obtained from VisaCheckout.
 *  - The deviceAPIRequest contains a JSON with encryptedPayload and deviceEndpoint.
 *  - Callbacks for success and error. Error callback provides a JSON with status and statusText.
 *    The success callback contains an encryptedResponse that requires decryption on server side.
 * Usage for Get Payment Options Request for StoredUserService:
 * new WLPaymentOptionsRequest()
 *           .deviceAPIRequest(JSON.parse(JSON.parse(response).deviceAPIRequest))
 *           .onSuccess(resolve)
 *           .onError(reject)
 *           .send()
 *
 * Where
 *  - The deviceAPIRequest contains a JSON with encryptedPayload and deviceEndpoint.
 *  - Callbacks for success and error. Error callback provides a JSON with status and statusText.
 *    The success callback contains an encryptedResponse that requires decryption on server side.
 *
 *
 * Usage:
 * var Request = new WLRedirectPaymentRequest()
 *      .ibpForm(document.getElementById("online_banking_details"), 'data-ibp')
 *      .deviceAPIRequest(deviceAPIRequest)
 *      .onSuccess(callback)
 *      .onError(callback)
 *      .send();
 *
 *  Where
 *  - The form has select list for banks.
 *  - The deviceAPIRequest contains a JSON with paymentMethodId , encryptedPayload and deviceEndpoint.
 *  - Callbacks for success and error. Error callback provides a JSON with status and statusText.
 *    The success callback contains an encryptedResponse that requires decryption on server side.
 *
 *Usage:
 * var Request = new WLPaymentMethodRequest()
 *      .pmType(paymentMethodType)
 *      .deviceAPIRequest(deviceAPIRequest)
 *      .onSuccess(callback)
 *      .onError(callback)
 *      .send();
 *
 *  Where
 *  - The deviceAPIRequest contains a JSON with paymentMethodType , encryptedPayload and deviceEndpoint.
 *  - Callbacks for success and error. Error callback provides a JSON with status and statusText.
 *    The success callback contains an encryptedResponse that requires decryption on server side.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var WLPaymentRequestState = {
    NEW: 1,
    SENT: 2,
    OK: 3,
    ERROR: 4,
    properties: {
        1: { name: "NEW", value: 1 },
        2: { name: "SENT", value: 2 },
        3: { name: "OK", value: 3 },
        4: { name: "ERROR", value: 4 }
    }
};
var state = WLPaymentRequestState.NEW;
var WLProcessRequest = /** @class */ (function () {
    function WLProcessRequest() {
    }
    WLProcessRequest.prototype.onSuccess = function (success) {
        this.successFn = success;
        return this;
    };
    ;
    WLProcessRequest.prototype.onError = function (error) {
        this.errorFn = error;
        return this;
    };
    ;
    WLProcessRequest.prototype.sendPayment = function (endpoint, data, method) {
        var xhttp = new XMLHttpRequest();
        xhttp.open(method, endpoint, true);
        xhttp.timeout = 60000;
        xhttp.setRequestHeader("Content-type", "application/json");
        var worldlineRequest = this;
        xhttp.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                state = WLPaymentRequestState.OK;
                worldlineRequest.successFn(JSON.parse(xhttp.response));
            }
            else if (this.status === 405) {
                state = WLPaymentRequestState.ERROR;
                worldlineRequest.errorFn({
                    status: this.status,
                    statusText: 'Please verify the Worldline Device API URL'
                });
            }
            else {
                state = WLPaymentRequestState.ERROR;
                worldlineRequest.errorFn({
                    status: this.status,
                    statusText: xhttp.statusText
                });
            }
        };
        xhttp.onerror = function () {
            state = WLPaymentRequestState.ERROR;
            worldlineRequest.errorFn({
                status: this.status,
                statusText: xhttp.statusText === '' ? 'Could not send transaction.' : xhttp.statusText
            });
        };
        xhttp.ontimeout = function () {
            state = WLPaymentRequestState.ERROR;
            worldlineRequest.errorFn({
                status: this.status,
                statusText: xhttp.statusText
            });
        };
        state = WLPaymentRequestState.SENT;
        if (method === "POST") {
            xhttp.send(data);
        }
        else if (method === "GET") {
            xhttp.send();
        }
    };
    ;
    return WLProcessRequest;
}());
var WLPaymentRequest = /** @class */ (function (_super) {
    __extends(WLPaymentRequest, _super);
    function WLPaymentRequest() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.method = "POST";
        return _this;
    }
    WLPaymentRequest.prototype.storedUser = function (n) {
        if ("provider" in n)
            this.provider = n.provider;
        if ("storedUserReference" in n)
            this.storedUserRef = n.storedUserReference;
        return this;
    };
    ;
    WLPaymentRequest.prototype.chdForm = function (document, tag) {
        var chdElements = document.querySelectorAll('[' + tag + ']');
        var chd = {};
        chdElements.forEach(function (x) {
            chd[x.attributes["data-chd"].nodeValue] = x.value;
            if (x.hasAttribute("name")) {
                console.warn("Form compliancy warning: input field " + x.attributes[tag].nodeValue + " has 'name' attribute");
            }
        });
        this.cardHolderName = chd["cardHolderName"];
        this.cardNumber = chd["cardNumber"];
        this.expDateMonth = chd["cardExpiryMonth"];
        this.expDateYear = chd["cardExpiryYear"];
        this.cvCode = chd["cardCVC"];
        return this;
    };
    ;
    WLPaymentRequest.prototype.deviceAPIRequest = function (n) {
        this.encryptedPayload = n.encryptedPayload;
        this.endpoint = n.deviceEndpoint;
        if (this.endpoint.indexOf("/api/v1/payments") > -1) {
            return this;
        }
        else {
            this.endpoint = this.endpoint.concat("/api/v1/payments");
            return this;
        }
    };
    ;
    WLPaymentRequest.prototype.storedUserReference = function (n) {
        this.storedUserRef = n;
        return this;
    };
    ;
    WLPaymentRequest.prototype.send = function () {
        var data = JSON.stringify({
            cardHolderName: this.cardHolderName,
            cardNumber: this.cardNumber,
            expDateMonth: this.expDateMonth,
            expDateYear: this.expDateYear,
            cvCode: this.cvCode,
            encryptedPayload: this.encryptedPayload,
            storedUserReference: this.storedUserRef,
            provider: this.provider
        });
        _super.prototype.sendPayment.call(this, this.endpoint, data, this.method);
        return this;
    };
    return WLPaymentRequest;
}(WLProcessRequest));
var WLRedirectPaymentRequest = /** @class */ (function (_super) {
    __extends(WLRedirectPaymentRequest, _super);
    function WLRedirectPaymentRequest() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.method = "POST";
        return _this;
    }
    WLRedirectPaymentRequest.prototype.deviceAPIRequest = function (n) {
        this.encryptedPayload = n.encryptedPayload;
        this.endpoint = n.deviceEndpoint;
        this.endpoint = this.endpoint.concat("/api/v1/redirectpayments");
        return this;
    };
    ;
    WLRedirectPaymentRequest.prototype.ibpForm = function (document, tag) {
        var el = document.querySelector('[' + tag + ']');
        this.paymentMethodId = el.value;
        return this;
    };
    ;
    WLRedirectPaymentRequest.prototype.send = function () {
        var data = JSON.stringify({
            paymentMethodId: this.paymentMethodId,
            encryptedPayload: this.encryptedPayload
        });
        _super.prototype.sendPayment.call(this, this.endpoint, data, this.method);
        return this;
    };
    return WLRedirectPaymentRequest;
}(WLProcessRequest));
var WLPaymentMethodRequest = /** @class */ (function (_super) {
    __extends(WLPaymentMethodRequest, _super);
    function WLPaymentMethodRequest() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.method = "POST";
        return _this;
    }
    WLPaymentMethodRequest.prototype.deviceAPIRequest = function (n) {
        this.encryptedPayload = n.encryptedPayload;
        this.endpoint = n.deviceEndpoint;
        this.endpoint = this.endpoint.concat("/api/v1/paymentmethods");
        return this;
    };
    ;
    WLPaymentMethodRequest.prototype.pmType = function (n) {
        this.paymentMethodType = n;
        return this;
    };
    ;
    WLPaymentMethodRequest.prototype.send = function () {
        var data = JSON.stringify({
            paymentMethodType: this.paymentMethodType,
            encryptedPayload: this.encryptedPayload
        });
        _super.prototype.sendPayment.call(this, this.endpoint, data, this.method);
        return this;
    };
    return WLPaymentMethodRequest;
}(WLProcessRequest));
var WLPaymentOptionsRequest = /** @class */ (function (_super) {
    __extends(WLPaymentOptionsRequest, _super);
    function WLPaymentOptionsRequest() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.method = "GET";
        return _this;
    }
    WLPaymentOptionsRequest.prototype.deviceAPIRequest = function (n) {
        this.encryptedPayload = n.encryptedPayload;
        this.endpoint = n.deviceEndpoint;
        if (this.endpoint.indexOf("/api/v1/paymentoptions") > -1) {
            this.endpoint.concat("?encryptedPayload=" + this.encryptedPayload);
            return this;
        }
        else {
            this.endpoint = this.endpoint.concat("/api/v1/paymentoptions?encryptedPayload=" + this.encryptedPayload);
            return this;
        }
    };
    ;
    WLPaymentOptionsRequest.prototype.send = function () {
        _super.prototype.sendPayment.call(this, this.endpoint, '', this.method);
        return this;
    };
    return WLPaymentOptionsRequest;
}(WLProcessRequest));
