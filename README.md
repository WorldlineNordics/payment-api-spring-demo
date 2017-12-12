
# Worldline Online Payments Acceptance - Spring Boot example
Using this Spring application, you can gain understanding of how the 
Worldline Online Payments Acceptance Payment API can be used in an easy integration directly from a device.

### What you'll need

* About 15 minutes
* [JDK 8](http://www.oracle.com/technetwork/java/javase/downloads/index.html) or later
* [Gradle](https://spring.io/guides/gs/gradle/#initial)
* A copy of this repository, or rather an installation of [Git](https://www.atlassian.com/git/tutorials/install-git)

## How to use
 
**Step 1**. Clone the application with Git, or [download a copy](https://github.com/WorldlineNordics/payment-api-spring-demo/archive/master.zip).
 ```bash
git clone https://github.com/WorldlineNordics/payment-api-spring-demo
```
 
**Step 2**. Start the demo application by
 ```bash
 ./gradlew bootRun
 ```

**Step 3**. Open [http://localhost:8080/] 


## Explanation of the demo

![Overview](/docs/overview-of-device-rest-api.png)

1.	The customer has completed shopping and is checking out from the merchant store.
2.	On checkout, the customer is presented with a payment page which is a HTML page hosted by the merchants themselves.
3.	The customer provides the name, billing info and other user details along with the card details like the card number, card holder name, cv code and expiry date. On submission, the customer details are passed to the merchant-script.js i.e. customer details will be sent directly to the merchant server.
4.	The merchant server connects to the Worldline script i.e. the worldline-script.js. This customer data is forwarded to PaymentAPI for encryption before sending to worldline-script.js.
5.	Further, the encrypted user details and the card details are sent by worldline-script.js by making a rest call to the Device REST API that resides in PaymentPageServer.
6.	PaymentPageServer processes the transaction which is authenticated with the bank and an encrypted response is sent back to the merchant. The PaymentAPI is responsible for encryption of this response and sends the unpack response back to the merchant informing the status of the transaction.
7.	Lastly, the merchant can display the order confirmation message along with the status of the transaction. 



## LICENSE
See [LICENSE] file

[LICENSE]: license

[http://localhost:8080/]: http://localhost:8080/