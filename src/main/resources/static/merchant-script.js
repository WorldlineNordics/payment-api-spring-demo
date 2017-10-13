// Pick the chd elements from the form (card, cvv, expdate)
var chdElements = document.querySelectorAll('[chd]');
var cardHolderName = chdElements[0];
var cardNo = chdElements[1];
var startMonth = chdElements[2];
var startYear = chdElements[3];
var expMonth = chdElements[4];
var expYear = chdElements[5];
var cvc = chdElements[6];
var errMsg = "";

var year = (new Date()).getFullYear(), selectStart = startYear, selectExp = expYear, option = null, next_year = null;
for(var i = 10; i >= 0; i--) {
    option = document.createElement("option");
    last_year = parseInt(year, 10) - i;
    option.value = last_year;
    option.innerHTML = last_year;
    selectStart.appendChild(option);
}

for(var i = 0; i <= 10; i++) {
    option = document.createElement("option");
    next_year = parseInt(year, 10) + i;
    option.value = next_year;
    option.innerHTML = next_year;
    selectExp.appendChild(option);
}

//check card no length    
function validateCardNo() {
	if(cardNo.value.length>="16"){
		//alert("The card number should be 15 or 16 digits");
		var str = cardNo.value;
		cardNo.value = str.slice(0,16);
	}else {
    	cardNo = chdElements[1];
    }
}

//check card no length
function validateCvc() {
	if(cvc.value.length>="4"){
		var str = cvc.value;
		cvc.value = str.slice(0,4);
	}else {
		cvc = chdElements[6];
    }
}

window.addEventListener("load", function () {	    
    // Access the form element...
    var form = document.getElementById("paymentForm");
            
    // ...and take over its submit event.
    form.addEventListener("submit", function (event) {
        event.preventDefault();        
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
	        	console.log(response);
	            // Call drwp-script.js method that calls Device REST API
	            sendPayment(cardHolderName.value,cardNo.value,startMonth.value,startYear.value,expMonth.value,expYear.value,cvc.value,response.encryptedPayload);
        	}
        });

        // Define what happens in case of error
        XHR.addEventListener("error", function() {
        	alert(this.status+' '+this.statusText +' Oups.! Something goes wrong.');
        });
                
        // Set up our request
        XHR.open("POST", "/api/users/registrations");

        // The data sent is what the user provided in the form
        XHR.send(FD);
    }
});