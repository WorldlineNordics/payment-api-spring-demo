package com.worldline.payments.demo.merchant;

import com.digitalriver.worldpayments.api.security6.JKSKeyHandlerV6;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.worldline.payments.api.*;
import com.worldline.payments.api.PaymentRequest.StoreFlag;
import com.worldline.payments.demo.merchant.utils.DemoConfiguration;
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
 * payload if the user does not already exist.
 * The second call is used by the demo javascript to decrypt the response payload.
 */
@Component
@Path("/users")
public class RegistrationEndpoint {

    @Autowired
    private DemoConfiguration props;

    @POST
    @Path("/registrations")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public RegistrationResponse registerForm(@FormDataParam("billingAddressLine1") String billingAddressLine1, @FormDataParam("billingAddressLine2") String billingAddressLine2, @FormDataParam("billingCity") String billingCity, @FormDataParam("billingZipCode") String billingZipCode, @FormDataParam("billingStateProvince") String billingStateProvince, @FormDataParam("billingCountryCode") String billingCountryCode, @FormDataParam("billingEmailAddress") String billingEmailAddress, @FormDataParam("billingBuyerType") String billingBuyerType, @FormDataParam("billingFullName") String billingFullName, @FormDataParam("birthDate") String birthDate, @FormDataParam("billingBuyerVATNumber") String billingBuyerVATNumber, @FormDataParam("billingMobilePhone") String billingMobilePhone) {

        // First we check if the user is already registered, and similar.
        boolean alreadyRegistered = false;

        // Initialize the PaymentHandler
        PaymentHandler handler = new PaymentHandler(new JKSKeyHandlerV6(props.keystorePath, props.keystorePwd, props.merchantKeyAlias, props.worldlineKeyAlias), props.worldlineURL);

        // Build the PaymentRequest.
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
                .setBillingBuyerVATNumber(billingBuyerVATNumber)
                .setMid(Long.parseLong(props.merchantId))
                .setPosId(props.posId)
                .setOrderId("Example_order_" + System.currentTimeMillis())
                .setAmount(new BigDecimal(100))
                .setCurrency("BRL")
                .setConsumerCountry("BR")
                .setConsumerLanguage("en")
                .setAuthorizationType(AuthorizationType.UNDEFINED)
                .setStoreFlag(StoreFlag.STORE)
                .createPaymentRequest();

        final String deviceAPIRequest = handler.createDeviceAPIRequest(details);

        // Return the deviceAPIRequest and custom information to the form.
        return new RegistrationResponse(deviceAPIRequest, alreadyRegistered);
    }

    @POST
    @Path("/unpackResponse")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public UnpackResponse unpackResponse(EncodedResponse encodedReponse) {
        PaymentHandler handler = new PaymentHandler(new JKSKeyHandlerV6(props.keystorePath, props.keystorePwd, props.merchantKeyAlias, props.worldlineKeyAlias), props.worldlineURL);

        PaymentResponse decodedResponse = handler.unpackResponse(encodedReponse.encResponse);

        // The contents of the decodedResponse can be saved in a database, but only select fields are public.

        UnpackResponse response = new UnpackResponse(decodedResponse.getStatus(),
                decodedResponse.getTransaction().getTransactionId(),
                decodedResponse.getOrderId(),
                decodedResponse.getPaymentMethodName());
        return response;
    }

    /**
     * Example response with a custom field like "alreadyRegistered" that illustrates several actions are executed
     * on the server side on the first call:
     * 1. Verifying if the user is already registered, or similar. Hence the example parameter alreadyRegistered.
     * 2. Creation and securing a paymentRequest.
     */
    public static class RegistrationResponse {

        private String deviceAPIRequest;
        private boolean alreadyRegistered;

        RegistrationResponse(String deviceAPIRequest, boolean alreadyRegistered) {
            this.deviceAPIRequest = deviceAPIRequest;
            this.alreadyRegistered = alreadyRegistered;
        }

        public String getDeviceAPIRequest() {
            return deviceAPIRequest;
        }

        public boolean isAlreadyRegistered() {
            return alreadyRegistered;
        }
    }

    public static class EncodedResponse {
        String encResponse;

        EncodedResponse(@JsonProperty("encResponse") String encResponse) {
            this.encResponse = encResponse;
        }
    }

    public static class UnpackResponse {
        String status;
        Long transactionId;
        String orderId;
        String paymentMethodName;


        UnpackResponse(@JsonProperty("status") String status,
                       @JsonProperty("transactionId") Long transactionId,
                       @JsonProperty("orderId") String orderId,
                       @JsonProperty("paymentMethodName") String paymentMethodName) {
            this.status = status;
            this.transactionId = transactionId;
            this.orderId = orderId;
            this.paymentMethodName = paymentMethodName;
        }

        public String getStatus() {
            return status;
        }

        public Long getTransactionId() {
            return transactionId;
        }

        public String getOrderId() {
            return orderId;
        }

        public String getPaymentMethodName() {
            return paymentMethodName;
        }
    }
}