package io.drwp.demo;

import org.glassfish.jersey.media.multipart.FormDataParam;
import org.springframework.stereotype.Component;
import com.digitalriver.worldpayments.api.PaymentPageHandler;
import com.digitalriver.worldpayments.api.PaymentPageRequest;
import com.digitalriver.worldpayments.api.PaymentPageResponse;
import io.drwp.demo.utils.PaymentUtils;
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
	public RegistrationResponse registerForm(@FormDataParam("ship-address") String shipAddress,
			@FormDataParam("ship-city") String shipCity, @FormDataParam("ship-zip") String shipZip,
			@FormDataParam("ship-state") String shipState, @FormDataParam("ship-country") String shipCountry,
			@FormDataParam("email") String email) {

		Properties prop = DemoApplication.prop;
		PaymentPageRequest details = new PaymentPageRequest();

		details.setShippingAddressLine1(shipAddress);
		details.setShippingCity(shipCity);
		details.setShippingZipCode(shipZip);
		details.setShippingStateProvince(shipState);
		details.setShippingCountryCode(shipCountry);
		details.setShippingEmailAddress(email);

		// Example transaction
		details.setMid(Long.parseLong(prop.getProperty("merchantId")));
		details.setPosId(prop.getProperty("orderId"));
		// Change to: details.setAmount(new BigDecimal..);
		details.setCurrency("EUR");
		// details.setTransactionType("authorize");
		details.setTransactionChannel("Web Online"); // Should default to Web
														// online
		// details.setAutoCapture(true) // On the PaymentPage Payment API,
		// tread false as authorize, true is debit

		PaymentPageHandler handler = PaymentUtils.getPaymentHandler();
		final String encryptedPayload = handler.encryptRequest(details);
		return new RegistrationResponse(encryptedPayload, false);
	}

	@POST
	@Path("/unpackResponse")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.TEXT_PLAIN)
	public String unpackResponse(String encodedResponseString) {

		PaymentPageHandler handler = PaymentUtils.getPaymentHandler();
		PaymentPageResponse decodedResponse = handler.unpackResponse("Payal");

		return decodedResponse.toString();
	}

}