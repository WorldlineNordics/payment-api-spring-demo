/*This script would contain the javascript functionality of the page ibp-result.html which would be showing the final transaction status for online banking.*/


window.addEventListener("load", function () {
	var url = new URL(window.location.href);
	var response = url.searchParams.get("response");
	console.log(response);
	if(response){
		unPackResponse(response);
	}
	else{
		var form = document.createElement('form');
		form.setAttribute('method','GET');
		form.setAttribute('action','http://localhost:1082/ibpcp');

		var cookies = document.cookie.split(';');

		var pp1 = getCookie('pp1');
		var el = document.createElement('input');

		el.setAttribute('type','hidden');
		el.setAttribute('name','pp');
		el.setAttribute('value',pp1);

		form.appendChild(el);

		document.body.appendChild(form);
		form.submit()
	}
});

function getCookie(name){
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) return parts.pop().split(";").shift();
}

function unPackResponse(response){
    	 makeRequest({
        	method: 'POST',
        	url: '/api/demo/unpackResponse',
        	encode: true,
        	params: JSON.stringify(response)
    	})
	
     .then(function (unpackedResponse) {
        response = JSON.parse(unpackedResponse);
    	 console.log(response);
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

function displayResult(result, error) {
    document.getElementById("payment-result").innerHTML = result;
    document.getElementById("payment-errors").innerHTML = error;
}

function showError(error) {
    console.error(error);
    displayResult("", "Error :" + error.status + ": " + error.statusText);
}