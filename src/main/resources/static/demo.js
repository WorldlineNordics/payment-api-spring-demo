
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
    checkForSession();
    
});

function  checkForSession(){
	if (typeof(Storage) !== "undefined") {
		
		//if initiate is processed, retrieve the user details
		if(sessionStorage.getItem("userDetails") != null){
			retrieveBillingInfo();
			var url = new URL(window.location.href);
			var response = url.searchParams.get("response");
			if(response){
				unpackResponse(response);
				sessionStorage.clear();
			}
			else{
				//process complete flow
				displayResult("Processing with Worldline.", "");
				var completUrl = sessionStorage.getItem("completeUrl");
				var form = document.createElement('form');
				form.setAttribute('method','GET');
				form.setAttribute('action',completUrl);
				var payload = sessionStorage.getItem("payload");
				var e = document.createElement('input');
	
				e.setAttribute('type','hidden');
				e.setAttribute('name','payload');
				e.setAttribute('value',payload);
	
				form.appendChild(e);
				var baseUri = form.baseURI;
				var params = {};
				var parts = baseUri.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
					params[key] = value;
				});
				
				for (var key in params) {				  
				  	var el = document.createElement('input');	
					el.setAttribute('type','hidden');
					el.setAttribute('name',key);
					el.setAttribute('value',params[key]);
					form.appendChild(el);
				}					
				document.body.appendChild(form);
				form.submit()
			}
				
		}
	}
}

function retrieveBillingInfo(){
	var formAsJson = JSON.parse(sessionStorage.getItem("userDetails"));
	var FD = new FormData(form);
	var object = {};
	FD.forEach(function (value, key) {
		if(document.getElementById(key)){
			document.getElementById(key).value = formAsJson[key];
		}
	});
}

function exec(pmType) {
    var formAsJson = formToJson(form,pmType);
    if(pmType == 'card'){
    	processCard(formAsJson);
    }
    else if (pmType == 'ibp'){
    	sessionStorage.setItem("userDetails", JSON.stringify(formAsJson));
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
        return makeWLPromise(JSON.parse(JSON.parse(response).deviceAPIRequest),formAsJson.paymentType)
    })
	.then(function(response){
		displayResult("Redirecting to bank's site.", "");
		if(response.bankUrl){
			redirectToBankSite(response);
		}
		else{
			//unpack response
			unpackResponse(response);
			sessionStorage.clear();
		}
	})
	.catch(function (err) {
        showError(err);
        sessionStorage.clear();
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
    object["hostUrl"] = window.location.href.replace("#closeModal","");
    return object;
}

function redirectToBankSite(res){
	ibpIframe = document.getElementById('ibpFrame');
	ibpIframe.style.display = "block";
	var idocument = ibpIframe.contentWindow.document;
	sessionStorage.setItem("payload", res.encryptedPayload);
	sessionStorage.setItem("completeUrl", res.ibpCompleteUrl);
	ibpForm = idocument.createElement("form");
	ibpForm.method = res.bankMethod;
	ibpForm.action = res.bankUrl;
	var parser = new DOMParser();
	var bankForm = res.bankForm
	var el = parser.parseFromString(bankForm, "text/html");
	ibpForm.appendChild(el.firstChild);
	ibpIframe.appendChild(ibpForm);
	ibpForm.submit();
	
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
		url:'/api/demo/paymentMethodEndPoint?pmType=ibp',
		
	})
	.then(function(response){
		
		makeRequest({
			method:'GET',
			url:response
		})
		.then(function(response){
			var pMethods = JSON.parse(response);
			var list = document.getElementById('ibpList');
			for(key in pMethods){
				var opt = document.createElement('option');
				opt.value = key;
		        opt.text = pMethods[key];
		        list.options.add(opt);
			}
			
		})
		.catch(function (err) {
			showError(err);
	    });
	})
	
}
