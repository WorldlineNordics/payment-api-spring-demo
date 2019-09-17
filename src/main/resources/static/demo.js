
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
var formAsJson;
var deviceEndpoint;
var encryptedPayload;

window.addEventListener("load", function () {
    form = document.getElementById("paymentForm");

    // Prevent form from being submitted
    form.addEventListener("submit", function (event) {
        event.preventDefault();
    });
    getPaymentMethods();
});

function exec(pmMethodType) {
	formAsJson = formToJson(form);
    if(pmMethodType == 'card'){
    	processAuthentication(formAsJson);
    }
    else if (pmMethodType == 'ibp' || pmMethodType == 'ewallet'){
    	initiateRedirect(formAsJson,pmMethodType);
    }
    else if(pmMethodType == 'eft'){
    	processEft(formAsJson);
    }
}

async function processAuthentication(formAsJson){
	try{
		var response = await makeRequest({
	        method: 'POST',
	        url: '/api/demo/registrations',
	        encode: false,
	        params: JSON.stringify(formAsJson)
	    })
		deviceEndpoint = JSON.parse(JSON.parse(response).deviceAPIRequest).deviceEndpoint;
		encryptedPayload = JSON.parse(JSON.parse(response).deviceAPIRequest).encryptedPayload;
		
	    displayResult("Processing Initiate Authentication with Worldline.", "");
	    var initResponse = await makeWLPromise(JSON.parse(JSON.parse(response).deviceAPIRequest),"initAuth")
	    
		if(initResponse.tDSMethodContent) {
			processTDSMethodContent(initResponse.tDSMethodContent);
		}
		await timeout(3000);
		
		if ('AUTHENTICATION' == initResponse.status && ('NOT_REQUIRED' == initResponse.authenticationStatus || 'SUCCESSFUL' == initResponse.authenticationStatus)) {
			//proceed with existing payment and display result
			displayResult("Authentication Successful. Proceed with Payment", "");
			var paymentReq = createPaymentRequest(deviceEndpoint, encryptedPayload, initResponse.worldlineSessionData);
	    	processCardAfterAuthentication(paymentReq);
		} else if('AUTHENTICATION' === initResponse.status && 'CONTINUE' === initResponse.authenticationStatus ) {
			
			var continueReq = createPaymentRequest(deviceEndpoint, encryptedPayload, initResponse.worldlineSessionData);
			displayResult("Processing Continue Authentication with Worldline.", "");
		    var continueResponse = await makeWLPromise(continueReq,"continueAuth")
			
		    if('AUTHENTICATION' === continueResponse.status && 'SUCCESSFUL' === continueResponse.authenticationStatus ) {
		    	//process with payment and display result
		    	displayResult("Authentication Successful. Proceed with Payment", "");
		    	var paymentReq = createPaymentRequest(deviceEndpoint, encryptedPayload, initResponse.worldlineSessionData);
		    	processCardAfterAuthentication(paymentReq);
		    } else if ('AUTHENTICATION' == continueResponse.status && 'REQUIRED' == continueResponse.authenticationStatus) {
		    	//rediect to ACS using iFrame
		    	displayResult("Processing Complete Authentication with Worldline.", "");
		    	processAuthenticationRedirect(continueResponse);	    	
		    } else {
				//Don't proceed for payment flow and show appropriate message to user.
		    	displayAutheticationResult(continueResponse.encResponse);
			}
		} else if ('AUTHENTICATION' == initResponse.status && 'REQUIRED' == initResponse.authenticationStatus) {
	    	//rediect to ACS using iFrame
	    	displayResult("Processing Complete Authentication with Worldline.", "");
	    	processAuthenticationRedirect(initResponse);
	    } else {
			//Don't proceed for payment flow and show appropriate message to user.
	    	displayAutheticationResult(initResponse.encResponse);
		}
	}
	catch(err){
		showError(err);
	}
}

function createPaymentRequest(deviceEndpoint, encryptedRequest, worldlineSessionData) {
	var paymentRequest = {};
	var encryptedPayload = {};
	
	encryptedPayload.encryptedRequest = encryptedRequest;
	encryptedPayload.worldlineSessionData = worldlineSessionData;
	
	paymentRequest.deviceEndpoint = deviceEndpoint;
	paymentRequest.encryptedPayload = JSON.stringify(encryptedPayload);
	return paymentRequest;
}

async function displayAutheticationResult(response){
	
    var unpackResponse = await makeRequest({
        method: 'POST',
        url: '/api/demo/unpackResponse',
        encode: true,
        params: response
    });
	
    var authResponse = JSON.parse(unpackResponse);
    displayResult("Authentication Status: " + authResponse.authenticationStatus
			+ "<br>Authentication Status Description: " + authResponse.authenticationStatusDescription
            + "<br>TransactionId: " + authResponse.transactionId
            + "<br>OrderId: " + authResponse.orderId
            + "<br>Payment Method: " + authResponse.paymentMethodName
            , "");
}

async function processCardAfterAuthentication(paymentReq){
	
    displayResult("Processing Payment with Worldline.", "");
    var response = await makeWLPromise(paymentReq,"card")
    	
	displayResult("Processing result with merchant.", "");
    var unpackResponse = await makeRequest({
        method: 'POST',
        url: '/api/demo/unpackResponse',
        encode: true,
        params: response.encResponse
    });
	
    var paymentResponse = JSON.parse(unpackResponse);
    displayResult("Status: " + paymentResponse.status
        + "<br>TransactionId: " + paymentResponse.transactionId
        + "<br>OrderId: " + paymentResponse.orderId
        + "<br>Payment Method: " + paymentResponse.paymentMethodName
        , "");
}

function processCard(formAsJson){
	makeRequest({
        method: 'POST',
        url: '/api/demo/registrations',
        encode: false,
        params: JSON.stringify(formAsJson)
    })
    .then(function (response) {
        displayResult("Processing Payment with Worldline.", "");
        return makeWLPromise(JSON.parse(JSON.parse(response).deviceAPIRequest),"card")
    })
	.then(function(response){
		displayResult("Processing result with merchant.", "");
        return makeRequest({
            method: 'POST',
            url: '/api/demo/unpackResponse',
            encode: true,
            params: response.encResponse
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
        displayResult("Processing Payment with Worldline.", "");
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
        displayResult("Processing Payment with Worldline.", "");
        return makeWLPromise(JSON.parse(JSON.parse(response).deviceAPIRequest),"eft")
    })
    .then(function(response){
		displayResult("Processing result with merchant.", "");
        return makeRequest({
            method: 'POST',
            url: '/api/demo/unpackResponse',
            encode: true,
            params: response.encResponse
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
    console.log(error);
    displayResult("", "Error :" + error.status + ": " + error.statusText);
}

function displayResult(result, error) {
    document.getElementById("payment-result").innerHTML = result;
    document.getElementById("payment-errors").innerHTML = error;
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
} 

function makeWLPromise(data,paymentMethodType) {
	
	if(paymentMethodType=="initAuth"){
	    return new Promise(function (resolve, reject) {
	        new Worldline.PaymentRequest()
	        .chdForm(document.getElementById("card_details"), 'data-chd')
	        .deviceAPIRequest(data)
	        .onSuccess(resolve)
	        .onError(reject)
	        .setPaymentMethodType(paymentMethodType)
	        .send()
	    })
	}
	if(paymentMethodType=="continueAuth"){
	    return new Promise(function (resolve, reject) {
	        new Worldline.PaymentRequest()
	        .deviceAPIRequest(data)
	        .onSuccess(resolve)
	        .onError(reject)
	        .setPaymentMethodType(paymentMethodType)
	        .send()
	    })
	}
	if(paymentMethodType=="card"){
	    return new Promise(function (resolve, reject) {
	        new Worldline.PaymentRequest()
	        .chdForm(document.getElementById("card_details"), 'data-chd')
	        .deviceAPIRequest(data)
	        .onSuccess(resolve)
	        .onError(reject)
	        .setPaymentMethodType(paymentMethodType)
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

function formToJson(form) {
    var FD = new FormData(form);
    var object = {};
    FD.forEach(function (value, key) {
        object[key] = value;
    });
    return object;
}

function createContinueRequest(form,initResponse) {
   
    return Object.assign(form, initResponse);;
}

function processTDSMethodContent(tDSMethodContent){
	var hiddenIframe=document.createElement('iframe');
	hiddenIframe.id="3dsHiddenFrame";
	hiddenIframe.name="3dsHiddenFrame";
	hiddenIframe.style="visibility:hidden; position:fixed; top:0px;bottom:0px;left:0px; right:0px; width:100%; height:100%; frameBorder:0;border:none; margin:0; padding:0;overflow:hidden; z-index:999999";
	hiddenIframe.sandbox ="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation";
	document.getElementById("hiddenIframeDiv").appendChild(hiddenIframe);
	var iframeDoc = document.getElementById('3dsHiddenFrame').contentDocument;
	iframeDoc.open();
	iframeDoc.write(tDSMethodContent);
	iframeDoc.close();
}

function processAuthenticationRedirect(response){
	redirectParameters = JSON.parse(response.redirectParameters);
	//create iframe and redirect to ACS
		
	acsIframe = document.createElement('iframe');
	acsIframe.src = "about:blank";

	acsIframe.id = "acsFrame";
	acsIframe.name = "acsFrame";
	acsIframe.style = "position:fixed; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999; background-color:#FFFFFF"
	acsIframe.sandbox =	"allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation";

	acsDiv = document.getElementById('iframeDiv')
	acsDiv.appendChild(acsIframe);

	var idocument = acsIframe.contentWindow.document;
	acsResponse = idocument.createElement("div");
	acsResponse.id = "acsResponse";
	acsResponse.name = "acsResponse";
	acsIframe.appendChild(acsResponse);

	acsForm = idocument.createElement("form");
	acsForm.target = "acsFrame";
	acsForm.method = response.redirectMethod;
	acsForm.action = response.redirectUrl;
	for (var name in redirectParameters) {
		var input = idocument.createElement('input');
		input.type = 'hidden';
		input.name = name;
		input.value = redirectParameters[name];
		acsForm.appendChild(input);
	}
	acsIframe.appendChild(acsForm);
	acsForm.submit();
}

function unpackResponse(response){
	makeRequest({
        method: 'POST',
        url: '/api/demo/unpackResponse',
        encode: true,
        params: response.encResponse
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
    var wlResponse = JSON.parse(e[key]);
    
    if('AUTHENTICATION' === wlResponse.type ) {
    	var params = wlResponse.parameters;
    	if('SUCCESSFUL' === params.authenticationStatus ) {
    		displayResult("Authentication Successful. Proceed with Payment", "");
    		var paymentReq = createPaymentRequest(deviceEndpoint, encryptedPayload, params.worldlineSessionData);
	    	processCardAfterAuthentication(paymentReq);
    	} else {
			//Don't proceed for payment flow and show appropriate message to user.
			displayResult("Order Id: " + params.orderId
			+ "<br>Authentication Status Description: " + params.authenticationStatusDescription
			+ "<br>Authentication Status: " + params.authenticationStatus
			, "");
		}
	} else {    
	    unpackResponse(wlResponse);
	}
    
    var redirectDiv = document.getElementById('iframeDiv');
    redirectDiv.removeChild(iframeDiv.childNodes[0]);
    console.log('data', wlResponse);

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