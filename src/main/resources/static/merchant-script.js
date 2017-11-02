// Pick the chd elements from the form (card, cvv, expdate)
var chdElements = document.querySelectorAll('[chd]');
var cardHolderName = chdElements[0];
var cardNo = chdElements[1];
var expMonth = chdElements[2];
var expYear = chdElements[3];
var cvc = chdElements[4];

var year = (new Date()).getFullYear(), selectExp = expYear, option = null, next_year = null;

for(var i = 0; i <= 10; i++) {
    option = document.createElement("option");
    next_year = parseInt(year, 10) + i;
    option.value = next_year;
    option.innerHTML = next_year;
    selectExp.appendChild(option);
}


cardNo.addEventListener("keydown", function (event) {
	if(event.which == 32){
		event.preventDefault();
	}         
});

//check card no length    
function validateCardNo() {	
	var cards = new Array();
    cards[0] = { cardName: "VISA", regEx: "^4[0-9]{12}([0-9]{3})?$"};
    cards[1] = { cardName: "MASTERCARD", regEx: "^5[1-5][0-9]{14}$"};
    cards[2] = { cardName: "AMEX", regEx: "^3[47][0-9]{13}$"};
    cards[3] = { cardName: "DINERS", regEx: "^3(0[0-5]|[68][0-9])[0-9]{11}$"};
    cards[4] = { cardName: "DISCOVER", regEx: "^6011[0-9]{12}$"};
    var cardNum = cardNo.value;
    var cardName = null;
    cardNum = cardNum.replace(/[^0-9]/g,'');
    if(cardNo){
	    for (var i=0; i< cards.length; i++) {
	      if (new RegExp(cards[i]["regEx"]).test(cardNum)) {
	        cardName =  cards[i]["cardName"];  
	        break;
	      }
	    }
	    if(cardName == null){
			alert("Invalid card number..Please provide valid card number");		
	    }
    }
}

//check card no length
function validateCvc() {
	if(cvc){
		if(cvc.value.length>="4"){
			var str = cvc.value;
			cvc.value = str.slice(0,4);
		}else if(cvc.value.length<"3"){
			alert("The CV Code should be of 3 or 4 digits");
	    }else {
			cvc = chdElements[4];
	    }
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
	            // Call drwp-script.js method that calls Device REST API
	            sendPayment(cardHolderName.value,cardNo.value,expMonth.value,expYear.value,cvc.value,response.encryptedPayload);
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

function sendResultToUnpack(transactionResult) {
    var xhttp = new XMLHttpRequest();
        
    // Define what happens when response recieved successfully
    xhttp.addEventListener("load", function() {
        if (this.readyState == 4 && this.status == 200) {
            var res =  JSON.parse(this.responseText);            
            alert("transaction description : "+ res.transaction.transactionDesc +" Tx Id :"+ res.transaction.transactionId);
            console.log(res);
       }
    });

    // Define what happens in case of error
    xhttp.addEventListener("error", function() {
    	alert(this.status+' '+this.statusText +' Oups.! Something goes wrong.');
    });

    // Set up our request
    xhttp.open("POST", "/api/users/unpackResponse");

    // The data sent is what the user provided in the form
    xhttp.send(transactionResult);
};