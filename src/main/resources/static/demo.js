
// Decorate HTML expiry year select box.
var year = (new Date()).getFullYear(), selectExp = document.getElementById("expYear"), option = null, next_year = null;

var pmTypes={"ibp":"ibpList", "eft":"eftList", "ewallet":"ewalletList"};

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
    else if (pmMethodType == 'ibp' || pmMethodType == 'ewallet'){
    	initiateRedirect(formAsJson,pmMethodType);
    }
    else if(pmMethodType == 'eft'){
    	processEft(formAsJson);
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

function initiateRedirect(formAsJson, pmMethodType){
	makeRequest({
        method: 'POST',
        url: '/api/demo/registrations',
        encode: false,
        params: JSON.stringify(formAsJson)
    })
    .then(function (response) {
        displayResult("Processing with Worldline.", "");
        if(pmMethodType=='ibp'){
        	return makeWLPromise(JSON.parse(JSON.parse(response).deviceAPIRequest),"ibp")
        }
        else if(pmMethodType=='ewallet'){
        	return makeWLPromise(JSON.parse(JSON.parse(response).deviceAPIRequest),"ewallet")
        }
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

function processEft(formAsJson){
	makeRequest({
        method: 'POST',
        url: '/api/demo/registrations',
        encode: false,
        params: JSON.stringify(formAsJson)
    })
    .then(function (response) {
        displayResult("Processing with Worldline.", "");
        return makeWLPromise(JSON.parse(JSON.parse(response).deviceAPIRequest),"eft")
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
                + "<br>Payment Slip URL: " +
                "<a href="+response.eftPaymentSlipUrl+" target='_blank'>"+response.eftPaymentSlipUrl+"</a>"
                , "");
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
	        new Worldline.PaymentRequest()
	        .chdForm(document.getElementById("card_details"), 'data-chd')
	        .deviceAPIRequest(data)
	        .onSuccess(resolve)
	        .onError(reject)
	        .send()
	    })
	}
	else if(paymentMethodType=="ibp"){
		return new Promise(function (resolve, reject) {
	        new Worldline.AlternatePaymentRequest()
	            .paymentForm(document.getElementById("online_banking_details"), 'data-ibp')
	            .deviceAPIRequest(data)
	            .onSuccess(resolve)
	            .onError(reject)
	            .send(paymentMethodType)
	    })
	}
	else if(paymentMethodType=='eft'){
		return new Promise(function (resolve,reject){
			 new Worldline.AlternatePaymentRequest()
			 	.paymentForm(document.getElementById("eft_details"), 'data-eft')
	            .deviceAPIRequest(data)
	            .onSuccess(resolve)
	            .onError(reject)
	            .send(paymentMethodType)
		})
	}
	else if(paymentMethodType=="ewallet"){
		return new Promise(function (resolve, reject) {
	        new Worldline.AlternatePaymentRequest()
	            .paymentForm(document.getElementById("ewallet_details"), 'data-ewallet')
	            .deviceAPIRequest(data)
	            .onSuccess(resolve)
	            .onError(reject)
	            .send(paymentMethodType)
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
		Object.keys(pmTypes).forEach(function(key){
			makeWLPromisePaymentMethods(data,key)
			.then(function(response){
			    var pMethods = response;
				var list = document.getElementById(pmTypes[key]);
				pMethods.forEach(function(pm){
				var opt = document.createElement('option');
				opt.value = pm.id;
				opt.text = pm.name;
				list.options.add(opt);
			    });
		    })
			.catch(function(err){
				showError(err);
			});
		})
	
	})
	.catch(function (err) {
        showError(err);
	});
}

//Created makeWLPromisePaymentMethods function to call PaymentMethodRequest for IBP, EFT and E-wallet
function makeWLPromisePaymentMethods(data,key){
	return new Promise(function (resolve, reject) {
        new Worldline.PaymentMethodRequest()
        .pmType(key)
        .deviceAPIRequest(data)
        .onSuccess(resolve)
        .onError(reject)
        .send()
	})
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
		var wlRedirectUrl = response.concat("/api/v1/redirects")
		var redirectIframe = document.createElement('iframe');

		redirectIframe.id = "redirectFrame";
		redirectIframe.name = "redirectFrame";
		redirectIframe.style = "position:fixed; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999; background-color:#FFFFFF"
		redirectIframe.sandbox =	"allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation";
			
		var redirectDiv = document.getElementById('iframeDiv');
		redirectDiv.appendChild(redirectIframe);
		
		var idocument = redirectIframe.contentWindow.document;
		var redirectForm = idocument.createElement("form");
		redirectForm.method = "POST";
		redirectForm.action = wlRedirectUrl;
		redirectForm.target = "redirectFrame";
		
		var reqElement = document.createElement('input');
		reqElement.setAttribute('type','hidden');
		reqElement.setAttribute('name','req');
		reqElement.setAttribute('value',req);
		redirectForm.appendChild(reqElement);
		
		redirectIframe.appendChild(redirectForm);
		redirectForm.submit();
		
	})
	
}

window.addEventListener('message',function(e) {
    var key = e.message ? 'message' : 'data';
    var wlResponse = e[key];
    unpackResponse(wlResponse);
    var redirectDiv = document.getElementById('iframeDiv');
    redirectDiv.removeChild(iframeDiv.childNodes[0]);
    console.log('message received');
    console.log('key', key)
    console.log('data', wlResponse)

},false);

function toggleCardDetails(){
	var cardDetails = document.getElementById('card_details');
	cardDetails.style.display  = cardDetails.style.display === 'none' ? 'block' : 'none'; 
	var ibpDetails = document.getElementById('online_banking_details');
	ibpDetails.style.display  = ibpDetails.style.display === 'block' ? 'none' : 'none'; 
	var eftDetails = document.getElementById('eft_details');
	eftDetails.style.display  = eftDetails.style.display === 'block' ? 'none' : 'none';
	var ewalletDetails = document.getElementById('ewallet_details');
	ewalletDetails.style.display  = ewalletDetails.style.display === 'block' ? 'none' : 'none'; 
}

function toggleIbpDetails(){
	var ibpDetails = document.getElementById('online_banking_details');
	ibpDetails.style.display  = ibpDetails.style.display === 'none' ? 'block' : 'none'; 
	var cardDetails = document.getElementById('card_details');
	cardDetails.style.display  = cardDetails.style.display === 'block' ? 'none' : 'none'; 
	var eftDetails = document.getElementById('eft_details');
	eftDetails.style.display  = eftDetails.style.display === 'block' ? 'none' : 'none';
	var ewalletDetails = document.getElementById('ewallet_details');
	ewalletDetails.style.display  = ewalletDetails.style.display === 'block' ? 'none' : 'none'; 
	
}

function toggleEftDetails(){
	var eftDetails = document.getElementById('eft_details');
	eftDetails.style.display  = eftDetails.style.display === 'none' ? 'block' : 'none'; 
	var cardDetails = document.getElementById('card_details');
	cardDetails.style.display  = cardDetails.style.display === 'block' ? 'none' : 'none'; 
	var ibpDetails = document.getElementById('online_banking_details');
	ibpDetails.style.display  = ibpDetails.style.display === 'block' ? 'none' : 'none'; 
	var ewalletDetails = document.getElementById('ewallet_details');
	ewalletDetails.style.display  = ewalletDetails.style.display === 'block' ? 'none' : 'none'; 
	
}

function toggle_eWalletDetails(){
	var ewalletDetails = document.getElementById('ewallet_details');
	ewalletDetails.style.display  = ewalletDetails.style.display === 'none' ? 'block' : 'none'; 
	var cardDetails = document.getElementById('card_details');
	cardDetails.style.display  = cardDetails.style.display === 'block' ? 'none' : 'none'; 
	var ibpDetails = document.getElementById('online_banking_details');
	ibpDetails.style.display  = ibpDetails.style.display === 'block' ? 'none' : 'none'; 
	var eftDetails = document.getElementById('eft_details');
	eftDetails.style.display  = eftDetails.style.display === 'block' ? 'none' : 'none';
}

function toggleBillingDetails(){
	var billingDetails = document.getElementById('billing_details');
	billingDetails.style.display  = billingDetails.style.display === 'none' ? 'block' : 'none'; 
	var shippingDetails = document.getElementById('shipping_details');
	shippingDetails.style.display  = shippingDetails.style.display === 'block' ? 'none' : 'none';  
}

function toggleShippingDetails(){
	var shippingDetails = document.getElementById('shipping_details');
	shippingDetails.style.display  = shippingDetails.style.display === 'none' ? 'block' : 'none'; 
	var billingDetails = document.getElementById('billing_details');
	billingDetails.style.display  = billingDetails.style.display === 'block' ? 'none' : 'none'; 
}