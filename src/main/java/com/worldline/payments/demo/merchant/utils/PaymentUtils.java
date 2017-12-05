package com.worldline.payments.demo.merchant.utils;

import com.digitalriver.worldpayments.api.security6.JKSKeyHandlerV6;
import com.worldline.payments.api.PaymentHandler;
import com.worldline.payments.api.PaymentResponse;
import com.worldline.payments.demo.merchant.UnpackResponse;

public class PaymentUtils {

    public static PaymentHandler getPaymentHandler(DemoConfiguration props) {
        return new PaymentHandler(new JKSKeyHandlerV6(props.keystorePath,
                props.keystorePwd,
                props.merchantKeyAlias,
                props.worldlineKeyAlias));
    }
    
    public static UnpackResponse getUnpackResponse(PaymentResponse response) {
        String status = null;
        if (response.getClientAnswerCode() == 0) {
        	status = "OK";
        } else {
        	status = "DECLINE";
        }
        return new UnpackResponse(response, status);
    }
}
