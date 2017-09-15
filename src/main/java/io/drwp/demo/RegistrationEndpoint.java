package io.drwp.demo;

import org.glassfish.jersey.media.multipart.FormDataParam;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;

/**
 * Demo endpoint that emulates registration of a user and returns an encrypted payload if
 * the user does not already exist.  The encryptedPayload will later be sent by the client
 * side.
 */
@Component
@Path("/users")
public class RegistrationEndpoint {

    @POST
    @Path("/registrations")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public RegistrationResponse registerForm(@FormDataParam("name") String name,
                                             @FormDataParam("ship-address") String shipAddress,
                                             @FormDataParam("ship-city") String shipCity,
                                             @FormDataParam("ship-zip") String shipZip,
                                             @FormDataParam("ship-state") String shipState,
                                             @FormDataParam("ship-country") String shipCountry,
                                             @FormDataParam("phone-number") String phoneNumber,
                                             @FormDataParam("email") String email,
                                             @FormDataParam("emailC") String emailC,
                                             @FormDataParam("cardNumber") String cardnumber,
                                             @FormDataParam("cardExpiry") String cardExpiry,
                                             @FormDataParam("cardCVC") String cardCVC) {

        if (!StringUtils.isEmpty(cardnumber) || !StringUtils.isEmpty((cardExpiry)) || !StringUtils.isEmpty(cardCVC)) {
            throw new IllegalArgumentException("Card holder data was received.");
        }

        String encryptedPayload = ""; // drwp library (mid, orderid, amount, currency, email);

        return new RegistrationResponse(encryptedPayload, false);
    }
}