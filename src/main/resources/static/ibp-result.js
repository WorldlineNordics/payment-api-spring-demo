/*This script would contain the javascript functionality of the page ibp-result.html which would be showing the final transaction status for online banking.*/


window.addEventListener("load", function () {
	var url = new URL(window.location.href);
	var response = url.searchParams.get("response");
	console.log(response);
	unPackResponse(response);
});

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