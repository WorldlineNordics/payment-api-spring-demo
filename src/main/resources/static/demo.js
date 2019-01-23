
// Decorate HTML expiry year select box.
var year = (new Date()).getFullYear(), selectExp = document.getElementById("expYear"), option = null, next_year = null;
for (var i = 0; i <= 10; i++) {
    option = document.createElement("option");
    next_year = parseInt(year, 10) + i;
    option.value = next_year;
    option.innerHTML = next_year;
    selectExp.appendChild(option);
}

var form;

window.addEventListener("load", function () {
    form = document.getElementById("paymentForm");

    // Prevent form from being submitted
    form.addEventListener("submit", function (event) {
        event.preventDefault();
    });
    
});

function exec(pmType) {
    var formAsJson = formToJson(form,pmType);
    if(pmType == 'card'){
    	processCard(formAsJson);
    }
    else if (pmType == 'ibp'){
    	processIbp(formAsJson);
    }
    
}


function processCard(formAsJson){
	
	makeRequest({
        method: 'POST',
        url: '/api/demo/registrations',
        encode: false,
        params: JSON.stringify(formAsJson)
    })
    .then(function (response) {
        displayResult("Processing with Worldline.", "");
        return makeWLPromise(JSON.parse(JSON.parse(response).deviceAPIRequest),formAsJson.paymentType)
    })
	.then(function(response){
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

function processIbp(formAsJson){
	makeRequest({
        method: 'POST',
        url: '/api/demo/registrations',
        encode: false,
        params: JSON.stringify(formAsJson)
    })
    .then(function (response) {
        displayResult("Processing with Worldline.", "");
        console.log("checking cookies")
        console.log(document.cookies);
        return makeWLPromise(JSON.parse(JSON.parse(response).deviceAPIRequest),formAsJson.paymentType)
    })
	.then(function(response){
		displayResult("Redirecting to bank's site.", "");
		if(response.bankUrl){
			redirectToBankSite(response);
		}
		else{
			//unpack response
			makeRequest({
	            method: 'POST',
	            url: '/api/demo/unpackResponse',
	            encode: true,
	            params: JSON.stringify(response)
	        })
	        .then(function (response) {
	        	response = JSON.parse(response);
	        	displayResult("Status: " + response.status
	        			+ "<br>TransactionId: " + response.transactionId
	        			+ "<br>OrderId: " + response.orderId
	        			+ "<br>Payment Method: " + response.paymentMethodName
	        			, "");
	        })
		}
	})
	.catch(function (err) {
        showError(err);
	});
	
}


function showError(error) {
    console.error(error);
    displayResult("", "Error :" + error.status + ": " + error.statusText);
}

function displayResult(result, error) {
    document.getElementById("payment-result").innerHTML = result;
    document.getElementById("payment-errors").innerHTML = error;
}

function makeWLPromise(data,paymentType) {
	
	if(paymentType=="card"){
	    return new Promise(function (resolve, reject) {
	        new WLPaymentRequest()
	            .cardForm(document.getElementById("card_details"), 'data-chd')
	            .deviceAPIRequest(data)
	            .onSuccess(resolve)
	            .onError(reject)
	            .send(paymentType)
	    })
	}
	else if(paymentType=="ibp"){
		return new Promise(function (resolve, reject) {
	        new WLPaymentRequest()
	            .ibpForm(document.getElementById("online_banking_details"), 'data-chd')
	            .deviceAPIRequest(data)
	            .onSuccess(resolve)
	            .onError(reject)
	            .send(paymentType)
	    })
	}
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

function formToJson(form,pmType) {
    var FD = new FormData(form);
    var object = {};
    FD.forEach(function (value, key) {
        object[key] = value;
    });
    object["paymentType"] = pmType;
    object["hostUrl"] = window.location.protocol+"//"+window.location.host;
    return object;
}

function redirectToBankSite(res){
	ibpIframe = document.getElementById('ibpFrame');
	ibpIframe.style.display = "block";
	var idocument = ibpIframe.contentWindow.document;
	document.cookie = "pp1="+res.encryptedPayload+";;path=/";
	ibpForm = idocument.createElement("form");
	ibpForm.target = "ibpFrame";
	ibpForm.method = res.bankMethod;
	ibpForm.action = res.bankUrl;
	var parser = new DOMParser();
	var bankForm = res.bankForm
	var el = parser.parseFromString(bankForm, "text/html");
	ibpForm.appendChild(el.firstChild);
	
	
	ibpIframe.appendChild(ibpForm);
	ibpForm.submit();
	
}
