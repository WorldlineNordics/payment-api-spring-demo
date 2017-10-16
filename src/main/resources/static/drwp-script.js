function sendPayment(cardHolderName, cardNo, startMonth, startYear, expMonth, expYear, cvv, encryptedPayload) {
	
    var xhttp = new XMLHttpRequest();
       
    // Bind the encrypted object and the elements
    //var  data = 'cardHolderName='+cardHolderName+'&cardNo='+cardNo+'&startMonth='+startMonth+'&startYear='+startYear+'&expMonth='+expMonth+'&expYear='+expYear+'&cvv='+cvv+'&encryptedPayload='+encryptedPayload;
     var data = JSON.stringify({cardHolderName : cardHolderName,
 	    		cardNo : cardNo,
 	    		startMonth : startMonth,
 	    		startYear : startYear,
 	    		expMonth : expMonth,
 	    		expYear : expYear,
 	    		cvv : cvv,
 	    		encryptedPayload : encryptedPayload});
	    		
	 
    
    // Define what happens when response recieved successfully
    xhttp.addEventListener("load", function() {
    	if (this.readyState == 4 && this.status == 200) {
    		var result =  this.responseText;
            
            // Call method that calls API to unpack response
    		sendResultToUnpack(result)
    	}
    });
      
    // Define what happens in case of error
    xhttp.addEventListener("error", function() {
    	alert(this.status+' '+this.statusText +' Oups.! Something goes wrong.');
    });
    
    // Set up our request
    xhttp.open("POST", "http://localhost:1234/api/v1/payments",true);
    
    xhttp.setRequestHeader('Access-Control-Request-Origin', 'http://localhost:1234/api/v1/payments');
    xhttp.setRequestHeader('Access-Control-Allow-Headers', 'Origin, Content-Type');
    
    
    // Set content type as json
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');

    // The data sent is what the user provided in the form
    xhttp.send(data);
};

function sendResultToUnpack(transactionResult) {
    var xhttp = new XMLHttpRequest();
        
    // Define what happens when response recieved successfully
    xhttp.addEventListener("load", function() {
        if (this.readyState == 4 && this.status == 200) {
            var res =  this.responseText;
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