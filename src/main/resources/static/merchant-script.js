// Pick the chd elements from the form (card, cvv, expdate)
var chdElements = document.querySelectorAll('[chd]');
var cardHolderName = chdElements[0];
var cardNo = chdElements[1];
var expMonth = chdElements[2];
var expYear = chdElements[3];
var cvc = chdElements[4];
var validCard = false, validCvc = false;
var year = (new Date()).getFullYear(), selectExp = expYear, option = null, next_year = null;

for(var i = 0; i <= 10; i++) {
    option = document.createElement("option");
    next_year = parseInt(year, 10) + i;
    option.value = next_year;
    option.innerHTML = next_year;
    selectExp.appendChild(option);
}

window.addEventListener("load", function () {	    
    // Access the form element...
    var form = document.getElementById("paymentForm");
            
    // ...and take over its submit event.
    form.addEventListener("submit", function (event) {
    	event.preventDefault();
    	displayResult('...','');
    	sendDataToMerchant();
    });
    
    function sendDataToMerchant() {    	
        var XHR = new XMLHttpRequest();
        
        // Bind the FormData object and the form element
        var FD = new FormData(form);

        // Define what happens on successful data submission
        XHR.addEventListener("load", function() {
        	if (this.readyState == 4 && this.status == 200) {
	        	var response = JSON.parse(this.responseText);
	            // Call drwp-script.js method that calls Device REST API
	            sendPayment(cardHolderName.value,cardNo.value,expMonth.value,expYear.value,cvc.value,response.encryptedPayload);
        	}
        });

        // Define what happens in case of error
        XHR.addEventListener("error", function() {
        	displayResult('','status :'+this.status+' '+this.statusText +' Oups.! Something goes wrong.');
        });
                
        // Set up our request
        XHR.open("POST", "/api/users/registrations");

        // The data sent is what the user provided in the form
        XHR.send(FD);
    }  
    
});

function sendResultToUnpack(transactionResult) {
    var xhttp = new XMLHttpRequest();
        
    // Define what happens when response recieved successfully
    xhttp.addEventListener("load", function() {
        if (this.readyState == 4 && this.status == 200) {
            var res =  JSON.parse(this.responseText);            
            console.log(res);
            displayResult("TransactionId:" + res.transaction.transactionId + "<br>Result: "+ res.transaction.transactionDesc , "");
       }
    });

    // Define what happens in case of error
    xhttp.addEventListener("error", function() {
    	displayResult("", 'Status: '+this.status+'<br>'+this.statusText);
    });

    // Set up our request
    xhttp.open("POST", "/api/users/unpackResponse");

    // The data sent is what the user provided in the form
    xhttp.send(transactionResult);
};

function displayResult(result, error) {
    document.getElementById("payment-result").innerHTML = result;
    document.getElementById("payment-errors").innerHTML = error;
}