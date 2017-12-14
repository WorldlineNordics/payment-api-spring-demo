# Worldline Online Payments Acceptance JavaScript API

## Integration with the API
There are two methods for calling on the API for processing with the Device Payment API
* Process, passing an HTML form reference , where the Worldline Online Payments Acceptance API will
  read the form data.
* Process, but the caller explicitly passes on the payment details.

### Method 1: Referencing the payment form  
```javascript
 var request = new WLPaymentRequest()
      .chdForm(document.getElementById("paymentForm"), 'data-chd')
      .deviceAPIRequest(deviceAPIRequest)
      .onSuccess(callback)
      .onError(callback)
      .send();
```
Callbacks for success and error are implemented by the merchant, see example implementation . Error callback provides a JSON with status and statusText. 
The success callback contains an encryptedResponse that requires decryption on server side.

Where the payment form might look like
```html
        <form id="paymentForm" 
        ...
        <input type="text" name="billingCountryCode" autocomplete="billing country">
        ...
        <input type="text" data-chd="cardNumber" autocomplete="cc-number">
 ```
Notes:
 * The form has input fields for cardNumber, cardExpiryMonth, cardExpiryYear, cardCVC.
 * The card holder data field has no "name" attribute, as that could risk that the cardholderdata gets passed to the merchant server. This method explicitly warns on the console in that case.

### Method 2: Pass on Card parameters
An alternate integration method, that supports a card objecet is also possible, 
like this example illustrates:

```javascript
        new WLPaymentRequest()
            .card({
                cardHolderName: "Carl Larsson",
                cardNumber: "1234567890123456",
                cardExpiryMonth: "12",
                cardExpiryYear: "34",
                cvCode: "123"
            })
            .deviceAPIRequest(JSON.parse(JSON.parse(response).deviceAPIRequest))
            .onSuccess(callback)
            .onError(callback)
            .send()
```

### CORS properties

CORS is managed by configuration at the server side of Worldline Online Payment Acceptance, in order to accept
payment requests from one or several merchant checkout pages.
1.	Access-Control-Allow-Headers – Origin, Content-Type and Accept
2.	Access-Control-Allow-Methods - POST
3.	Content-Type - application/json
The preflight request to the Worldline API will first check if these headers are allowed or not. If yes, then it will proceed with the POST call. If invalid headers or merchant base URLs found, the request is declined.

