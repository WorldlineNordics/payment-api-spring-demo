
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
    getPaymentMethods();
});

function exec(pmMethodType) {
    var formAsJson = formToJson(form);
    if(pmMethodType == 'card'){
    	processCard(formAsJson);
    }
    else if (pmMethodType == 'ibp'){
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
        return makeWLPromise(JSON.parse(JSON.parse(response).deviceAPIRequest),"card")
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
        return makeWLPromise(JSON.parse(JSON.parse(response).deviceAPIRequest),"ibp")
    })
	.then(function(response){
		if(response.bankUrl){
			displayResult("Redirecting to bank's site.", "");
			processRedirect(response);
		}
		else{
			//unpack response
			unpackResponse(response);
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

function makeWLPromise(data,paymentMethodType) {
	
	if(paymentMethodType=="card"){
	    return new Promise(function (resolve, reject) {
	        new WLPaymentRequest()
	            .chdForm(document.getElementById("card_details"), 'data-chd')
	            .deviceAPIRequest(data)
	            .onSuccess(resolve)
	            .onError(reject)
	            .send()
	    })
	}
	else if(paymentMethodType=="ibp"){
		return new Promise(function (resolve, reject) {
	        new WLRedirectPaymentRequest()
	            .ibpForm(document.getElementById("online_banking_details"), 'data-chd')
	            .deviceAPIRequest(data)
	            .onSuccess(resolve)
	            .onError(reject)
	            .send()
	    })
	}
}

function makeRequest(opts) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(opts.method, opts.url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 400) {
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

function formToJson(form,pmMethodType) {
    var FD = new FormData(form);
    var object = {};
    FD.forEach(function (value, key) {
        object[key] = value;
    });
    return object;
}


function unpackResponse(response){
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

function getPaymentMethods(){
	makeRequest({
		method:'GET',
		url:'/api/demo/paymentMethodEndPoint',
		
	})
	.then(function(response){
		var data = JSON.parse(response);
		return new Promise(function (resolve, reject) {
	        new WLPaymentMethodRequest()
            .pmType("ibp")
            .deviceAPIRequest(data)
            .onSuccess(resolve)
            .onError(reject)
            .send()
		})
	})
	.then(function(response){
		var pMethods = response;
		var list = document.getElementById('ibpList');
		pMethods.forEach(function(pm){
			var opt = document.createElement('option');
			opt.value = pm.id;
		    opt.text = pm.name;
		    list.options.add(opt);
		});
	})
	.catch(function (err) {
        showError(err);
	});
}

function processRedirect(res){
	
	var req =JSON.stringify({
		encryptedPayload:res.encryptedPayload,
		url:res.bankUrl,
		form:res.bankForm,
		method:res.bankMethod
	})
	
	makeRequest({
		method:'GET',
		url:'/api/demo/redirectEndPoint',
		
	})
	.then(function(response){
		
		//create iframe and redirect to bank's site
		
		var ibpIframe = document.createElement('iframe');

		ibpIframe.id = "ibpFrame";
		ibpIframe.name = "ibpFrame";
		ibpIframe.style = "position:fixed; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999; background-color:#FFFFFF"
		ibpIframe.sandbox =	"allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation";
			
		var ibpDiv = document.getElementById('iframeDiv');
		ibpDiv.appendChild(ibpIframe);
		
		var idocument = ibpIframe.contentWindow.document;
		var ibpForm = idocument.createElement("form");
		ibpForm.method = "POST";
		ibpForm.action = response;
		ibpForm.target = "ibpFrame";
		
		var reqElement = document.createElement('input');
		reqElement.setAttribute('type','hidden');
		reqElement.setAttribute('name','req');
		reqElement.setAttribute('value',req);
		ibpForm.appendChild(reqElement);
		
		ibpIframe.appendChild(ibpForm);
		ibpForm.submit();
		
	})
	
}

window.addEventListener('message',function(e) {
    var key = e.message ? 'message' : 'data';
    var wlResponse = e[key];
    unpackResponse(wlResponse);
    var ibpDiv = document.getElementById('iframeDiv');
    ibpDiv.removeChild(ibpDiv.childNodes[0]);
    console.log('message received');
    console.log('key', key)
    console.log('data', wlResponse)

},false);
