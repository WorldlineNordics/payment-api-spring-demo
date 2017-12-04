package io.drwp.demo.utils;

import java.util.Properties;

import com.digitalriver.worldpayments.api.security6.JKSKeyHandlerV6;
import com.worldline.payments.api.PaymentHandler;

import io.drwp.demo.DemoApplication;

public class PaymentUtils {

    public static PaymentHandler getPaymentHandler() {
    	Properties prop = DemoApplication.getProperties();
        PaymentHandler handler = new PaymentHandler(new JKSKeyHandlerV6(prop.getProperty("device.rest.api.keystore.path"), prop.getProperty("device.rest.api.keystore.pwd"), "merchant", "ngcert"));
        return handler;
    }
    
}
