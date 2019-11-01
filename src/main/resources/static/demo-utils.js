
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
	form = document.getElementById("paymentForm");
	// Prevent form from being submitted
	form.addEventListener("submit", function (event) {
		event.preventDefault();
	});
	getPaymentMethods();
});

async function exec(pmMethodType) {
	formAsJson = formToJson(form);
	var response = await makeRequest({
		method: 'POST',
		url: '/api/demo/registrations',
		encode: false,
		params: JSON.stringify(formAsJson)
	})
	deviceAPIRequest = JSON.parse(JSON.parse(response).deviceAPIRequest);
	requestTimeout = JSON.parse(response).requestTimeout;
	service = new Worldline.PaymentService(deviceAPIRequest);
	service.setRequestTimeout(requestTimeout);
	if (pmMethodType == 'card') {
		processAuthentication(formAsJson);
	}
	else if (pmMethodType == 'ibp' || pmMethodType == 'ewallet') {
		initiateRedirect(formAsJson, pmMethodType);
	}
	else if (pmMethodType == 'eft') {
		processEft(formAsJson);
	}
}

function showError(error) {
	console.log(error);
	displayResult("", "Error :" + error.status + ": " + error.statusText);
}

function displayResult(result, error) {
	document.getElementById("payment-result").innerHTML = result;
	document.getElementById("payment-errors").innerHTML = error;
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

async function unpackResponse(response) {
	var response = await makeRequest({
		method: 'POST',
		url: '/api/demo/unpackResponse',
		encode: true,
		params: JSON.stringify(response)
	})	
	response = JSON.parse(response);
	displayResult(getResult(response), "");
}

function getResult(response) {	
	var result = "";
	result = appendIfNotBlank(result, response.status, "Status : ");
	result = appendIfNotBlank(result, response.transactionId, "<br>TransactionId : ");
	result = appendIfNotBlank(result, response.orderId, "<br>OrderId : ");
	result = appendIfNotBlank(result, response.paymentMethodName, "<br>Payment Method : ");
	result = appendIfNotBlank(result, response.authenticationStatus, "<br>Authentication Status : ");
	result = appendIfNotBlank(result, response.authenticationStatusDescription, "<br>Authentication Status Description : ");
	result = appendIfNotBlank(result, response.eftPaymentSlipUrl , "<br>Payment Slip URL : " + "<a href=" + response.eftPaymentSlipUrl + " target='_blank'>") + "</a>";
	return result;
}

function appendIfNotBlank(result, resValue, resField) { return result += resValue ? resField + resValue : "" };

function processTDSMethodContent(tDSMethodContent) {
	var hiddenIframe = getRedirectIFrame("3dsHiddenFrame");
	hiddenIframe.style = "visibility:hidden";
	
	document.getElementById("hiddenIframeDiv").appendChild(hiddenIframe);
	var iframeDoc = hiddenIframe.contentDocument;
	iframeDoc.open();
	iframeDoc.write(tDSMethodContent);
	iframeDoc.close();
}

function processAuthenticationRedirect(response) {
	redirectParameters = JSON.parse(response.redirectParameters);
	//create iframe and redirect to ACS

	acsIframe = getRedirectIFrame("acsFrame");
	
	acsDiv = document.getElementById('iframeDiv')
	acsDiv.appendChild(acsIframe);

	var idocument = acsIframe.contentWindow.document;
	acsResponse = idocument.createElement("div");
	acsResponse.id = "acsResponse";
	acsResponse.name = "acsResponse";
	acsIframe.appendChild(acsResponse);

	acsForm = getRedirectForm(idocument, response.redirectMethod, response.redirectUrl, "acsFrame");
	
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

async function processRedirect(res) {
	var req = JSON.stringify({
		encryptedPayload: res.encryptedPayload,
		url: res.bankUrl,
		form: res.bankForm,
		method: res.bankMethod
	})
	var response = await makeRequest({
		method: 'GET',
		url: '/api/demo/redirectEndPoint',
	})
	//create iframe and redirect to bank's site
	var wlRedirectUrl = JSON.parse(response).wlRedirectUrl;
	var redirectIframe = getRedirectIFrame("redirectFrame");

	var redirectDiv = document.getElementById('iframeDiv');
	redirectDiv.appendChild(redirectIframe);

	var idocument = redirectIframe.contentWindow.document;
	var redirectForm = getRedirectForm(idocument, 'POST', wlRedirectUrl, "redirectFrame");

	var reqElement = document.createElement('input');
	reqElement.setAttribute('type', 'hidden');
	reqElement.setAttribute('name', 'req');
	reqElement.setAttribute('value', req);
	redirectForm.appendChild(reqElement);

	redirectIframe.appendChild(redirectForm);
	redirectForm.submit();
}

function getRedirectIFrame(redirectFrame) {
	var redirectIframe = document.createElement('iframe');
	redirectIframe.id = redirectFrame;
	redirectIframe.name = redirectFrame;
	redirectIframe.style = "position:fixed; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999; background-color:#FFFFFF"
	redirectIframe.sandbox = "allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation";
	return redirectIframe;
}

function getRedirectForm(idocument, method, redirectUrl, redirectFrame) {
	var redirectForm = idocument.createElement("form");
	redirectForm.method = method;
	redirectForm.action = redirectUrl;
	redirectForm.target = redirectFrame;
	return redirectForm;
}

function toggleCardDetails() {
	var cardDetails = document.getElementById('card_details');
	cardDetails.style.display = cardDetails.style.display === 'none' ? 'block' : 'none';
	var ibpDetails = document.getElementById('online_banking_details');
	ibpDetails.style.display = ibpDetails.style.display === 'block' ? 'none' : 'none';
	var eftDetails = document.getElementById('eft_details');
	eftDetails.style.display = eftDetails.style.display === 'block' ? 'none' : 'none';
	var ewalletDetails = document.getElementById('ewallet_details');
	ewalletDetails.style.display = ewalletDetails.style.display === 'block' ? 'none' : 'none';
}

function toggleIbpDetails() {
	var ibpDetails = document.getElementById('online_banking_details');
	ibpDetails.style.display = ibpDetails.style.display === 'none' ? 'block' : 'none';
	var cardDetails = document.getElementById('card_details');
	cardDetails.style.display = cardDetails.style.display === 'block' ? 'none' : 'none';
	var eftDetails = document.getElementById('eft_details');
	eftDetails.style.display = eftDetails.style.display === 'block' ? 'none' : 'none';
	var ewalletDetails = document.getElementById('ewallet_details');
	ewalletDetails.style.display = ewalletDetails.style.display === 'block' ? 'none' : 'none';

}

function toggleEftDetails() {
	var eftDetails = document.getElementById('eft_details');
	eftDetails.style.display = eftDetails.style.display === 'none' ? 'block' : 'none';
	var cardDetails = document.getElementById('card_details');
	cardDetails.style.display = cardDetails.style.display === 'block' ? 'none' : 'none';
	var ibpDetails = document.getElementById('online_banking_details');
	ibpDetails.style.display = ibpDetails.style.display === 'block' ? 'none' : 'none';
	var ewalletDetails = document.getElementById('ewallet_details');
	ewalletDetails.style.display = ewalletDetails.style.display === 'block' ? 'none' : 'none';

}

function toggle_eWalletDetails() {
	var ewalletDetails = document.getElementById('ewallet_details');
	ewalletDetails.style.display = ewalletDetails.style.display === 'none' ? 'block' : 'none';
	var cardDetails = document.getElementById('card_details');
	cardDetails.style.display = cardDetails.style.display === 'block' ? 'none' : 'none';
	var ibpDetails = document.getElementById('online_banking_details');
	ibpDetails.style.display = ibpDetails.style.display === 'block' ? 'none' : 'none';
	var eftDetails = document.getElementById('eft_details');
	eftDetails.style.display = eftDetails.style.display === 'block' ? 'none' : 'none';
}

function toggleBillingDetails() {
	var billingDetails = document.getElementById('billing_details');
	billingDetails.style.display = billingDetails.style.display === 'none' ? 'block' : 'none';
	var shippingDetails = document.getElementById('shipping_details');
	shippingDetails.style.display = shippingDetails.style.display === 'block' ? 'none' : 'none';
}

function toggleShippingDetails() {
	var shippingDetails = document.getElementById('shipping_details');
	shippingDetails.style.display = shippingDetails.style.display === 'none' ? 'block' : 'none';
	var billingDetails = document.getElementById('billing_details');
	billingDetails.style.display = billingDetails.style.display === 'block' ? 'none' : 'none';
}
