package io.drwp.demo;

import org.glassfish.jersey.media.multipart.FormDataParam;
import org.springframework.stereotype.Component;

import com.digitalriver.worldpayments.api.AuthorizationType;
import com.digitalriver.worldpayments.api.PaymentHandler;
import com.digitalriver.worldpayments.api.PaymentRequest;
import com.digitalriver.worldpayments.api.PaymentRequest.StoreFlag;
import com.digitalriver.worldpayments.api.PaymentRequestBuilder;
import com.digitalriver.worldpayments.api.PaymentResponse;
import com.google.gson.Gson;

import io.drwp.demo.utils.PaymentUtils;

import java.math.BigDecimal;
import java.util.Properties;

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
	public RegistrationResponse registerForm(@FormDataParam("billingAddressLine1") String billingAddressLine1, @FormDataParam("billingAddressLine2") String billingAddressLine2,
			@FormDataParam("billingCity") String billingCity, @FormDataParam("billingZipCode") String billingZipCode,
			@FormDataParam("billingStateProvince") String billingStateProvince, @FormDataParam("billingCountryCode") String billingCountryCode,
			@FormDataParam("billingEmailAddress") String billingEmailAddress, @FormDataParam("billingBuyerType") String billingBuyerType,  
			@FormDataParam("billingFullName") String billingFullName,  @FormDataParam("birthDate") String birthDate,  
			@FormDataParam("billingBuyerVATNumber") String billingBuyerVATNumber,  @FormDataParam("billingMobilePhone") String billingMobilePhone) {

		Properties prop = DemoApplication.getProperties();
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
		.setMid(Long.parseLong(prop.getProperty("device.rest.api.merchantId")))
		.setPosId(prop.getProperty("device.rest.api.posId"))
		.setOrderId("DRP_" + System.currentTimeMillis())
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

		PaymentHandler handler = PaymentUtils.getPaymentHandler();
		final String encryptedPayload = handler.encryptRequest(details);
		final String path = prop.getProperty("device.rest.api.server.path");
		return new RegistrationResponse(encryptedPayload, false, path);
	}

	@POST
	@Path("/unpackResponse")
	@Consumes(MediaType.TEXT_PLAIN)
	@Produces(MediaType.APPLICATION_JSON)
	public String unpackResponse(String encodedResponseString) {	

		PaymentHandler handler = PaymentUtils.getPaymentHandler();
		PaymentResponse decodedResponse = handler.unpackResponse(encodedResponseString);
		Gson gsonString = new Gson();
		String upnpacked = gsonString.toJson(decodedResponse);
		return upnpacked;
	}

}