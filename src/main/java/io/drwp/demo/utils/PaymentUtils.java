package io.drwp.demo.utils;

import com.digitalriver.worldpayments.api.PaymentPageHandler;
import com.digitalriver.worldpayments.api.security6.JKSKeyHandlerV6;

public class PaymentUtils {

    public static PaymentPageHandler getPaymentHandler() {
        PaymentPageHandler handler = new PaymentPageHandler(new JKSKeyHandlerV6("src/main/resources/merchant2048.jks", "x923##.Lkk", "merchant", "ngcert"));
        return handler;
    }
    
}
