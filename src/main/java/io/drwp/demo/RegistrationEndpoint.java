package io.drwp.demo;

import org.glassfish.jersey.media.multipart.FormDataParam;
import org.springframework.stereotype.Component;
import com.digitalriver.worldpayments.api.PaymentPageHandler;
import com.digitalriver.worldpayments.api.PaymentPageRequest;
import com.digitalriver.worldpayments.api.PaymentPageResponse;
import com.google.gson.Gson;

import io.drwp.demo.utils.PaymentUtils;

import java.math.BigDecimal;
import java.util.Properties;
import java.util.UUID;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;

/**
 * Demo endpoint that emulates registration of a user and returns an encrypted
 * payload if the user does not already exist. The encryptedPayload will later
 * be sent by the client side.
 */
@Component
@Path("/users")
public class RegistrationEndpoint {

	@POST
	@Path("/registrations")
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	@Produces(MediaType.APPLICATION_JSON)
	public RegistrationResponse registerForm(@FormDataParam("billingAddress1") String billingAddress1, @FormDataParam("billingAddress2") String billingAddress2,
			@FormDataParam("billingCity") String billingCity, @FormDataParam("billingZip") String billingZip,
			@FormDataParam("billingState") String billingState, @FormDataParam("billingCountry") String billingCountry,
			@FormDataParam("billingEmailAddress") String billingEmailAddress, @FormDataParam("billingBuyerType") String billingBuyerType,  
			@FormDataParam("billingFullName") String billingFullName,  @FormDataParam("birthdate") String birthdate,  
			@FormDataParam("billingBuyerVATNumber") String billingBuyerVATNumber,  @FormDataParam("billingMobilePhone") String billingMobilePhone) {

		Properties prop = DemoApplication.prop;
		PaymentPageRequest details = new PaymentPageRequest();

		details.setBillingAddressLine1(billingAddress1);
		details.setBillingAddressLine2(billingAddress2);
		details.setBillingCity(billingCity);
		details.setBillingZipCode(billingZip);
		details.setBillingStateProvince(billingState);
		details.setBillingCountryCode(billingCountry);
		details.setBillingEmailAddress(billingEmailAddress);
		details.setBillingBuyerType(billingBuyerType);
		details.setBillingFullName(billingFullName);
		details.setBirthDate(birthdate);
		details.setBillingBuyerVatNumber(billingBuyerVATNumber);
		details.setBillingMobilePhone(billingMobilePhone);

		// Example transaction
		details.setMid(Long.parseLong(prop.getProperty("merchantId")));
		details.setPosId(prop.getProperty("posId"));
		details.setOrderId(UUID.randomUUID().toString());
		details.setAmount(new BigDecimal(100));
		details.setCurrency("USD");
		details.setTransactionType("DEBIT");
		details.setTransactionChannel("Web Online");
		details.setPaymentMethodId(1000);
		
		// Should default to Web
	    													// online
		// details.setAutoCapture(true) // On the PaymentPage Payment API,
		// tread false as authorize, true is debit

		PaymentPageHandler handler = PaymentUtils.getPaymentHandler();
		final String encryptedPayload = handler.encryptRequest(details);
		return new RegistrationResponse(encryptedPayload, false);
	}

	@POST
	@Path("/unpackResponse")
	@Consumes(MediaType.TEXT_PLAIN)
	@Produces(MediaType.APPLICATION_JSON)
	public String unpackResponse(String encodedResponseString) {	

		PaymentPageHandler handler = PaymentUtils.getPaymentHandler();
		PaymentPageResponse decodedResponse = handler.unpackResponse(encodedResponseString);
		Gson gsonString = new Gson();
		String upnpacked = gsonString.toJson(decodedResponse);
		return upnpacked;
	}

}