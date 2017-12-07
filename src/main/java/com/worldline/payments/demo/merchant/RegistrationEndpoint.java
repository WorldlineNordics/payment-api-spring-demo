package com.worldline.payments.demo.merchant;

import com.google.gson.Gson;
import com.worldline.payments.api.*;
import com.worldline.payments.api.PaymentRequest.StoreFlag;
import com.worldline.payments.demo.merchant.utils.DemoConfiguration;
import com.worldline.payments.demo.merchant.utils.PaymentUtils;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.math.BigDecimal;

/**
 * Demo endpoint that emulates registration of a user and returns an encrypted
 * payload if the user does not already exist. The encryptedPayload will later
 * be sent by the client side.
 */
@Component
@Path("/users")
public class RegistrationEndpoint {
	
	Gson gsonString = new Gson();

	@Autowired
	private DemoConfiguration props;

	@POST
	@Path("/registrations")
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	@Produces(MediaType.APPLICATION_JSON)
	public RegistrationResponse registerForm(@FormDataParam("billingAddressLine1") String billingAddressLine1, @FormDataParam("billingAddressLine2") String billingAddressLine2,
			@FormDataParam("billingCity") String billingCity, @FormDataParam("billingZipCode") String billingZipCode,
			@FormDataParam("billingStateProvince") String billingStateProvince, @FormDataParam("billingCountryCode") String billingCountryCode,
			@FormDataParam("billingEmailAddress") String billingEmailAddress, @FormDataParam("billingBuyerType") String billingBuyerType,
			@FormDataParam("billingFullName") String billingFullName,  @FormDataParam("birthDate") String birthDate,
			@FormDataParam("billingBuyerVATNumber") String billingBuyerVATNumber,  @FormDataParam("billingMobilePhone") String billingMobilePhone) {

		// First we check if the user is already registered, and similar.
		boolean alreadyRegistered = false;

		// Build the encrypted PaymentRequest
		PaymentRequest details = new PaymentRequestBuilder()
		.setBillingAddressLine1(billingAddressLine1)
		.setBillingAddressLine2(billingAddressLine2)
		.setBillingCity(billingCity)
		.setBillingZipCode(billingZipCode)
		.setBillingStateProvince(billingStateProvince)
		.setBillingCountryCode(billingCountryCode)
		.setBillingEmailAddress(billingEmailAddress)
		.setBillingBuyerType(billingBuyerType)
		.setBillingFullName(billingFullName)
		.setBirthDate(birthDate)
		.setBillingMobilePhone(billingMobilePhone)
		.setMid(Long.parseLong(props.merchantId))
		.setPosId(props.posId)
		.setOrderId("Example_order_" + System.currentTimeMillis())
		.setAmount(new BigDecimal(100))
		.setCurrency("BRL")
		.setTransactionChannel("Web Online")
		.setPaymentMethodId(1000)
		.setConsumerCountry("BR")
		.setConsumerLanguage("en")
		.setAuthorizationType(AuthorizationType.UNDEFINED)
		.setStoreFlag(StoreFlag.STORE)
		.setBillingBuyerVATNumber(billingBuyerVATNumber)
		.createPaymentRequest();

		// Encrypt the request
		PaymentHandler handler = PaymentUtils.getPaymentHandler(props);
		final String encryptedPayload = handler.encryptRequest(details);

		// Return a JSON object to the form.
		return new RegistrationResponse(encryptedPayload, alreadyRegistered, props.worldlineURL);
	}

	@POST
	@Path("/unpackResponse")
	@Consumes(MediaType.TEXT_PLAIN)
	@Produces(MediaType.APPLICATION_JSON)
	public String unpackResponse(String encodedResponseString) {	

		PaymentHandler handler = PaymentUtils.getPaymentHandler(props);
		PaymentResponse decodedResponse = handler.unpackResponse(encodedResponseString);
		System.out.println("Decoded Response : "+ gsonString.toJson(decodedResponse));
		UnpackResponse response = new UnpackResponse(decodedResponse.getStatus(), decodedResponse.getTransaction().getTransactionId(), decodedResponse.getOrderId());
		String upnpacked = gsonString.toJson(response);
		return upnpacked;
	}

}