package io.drwp.demo.utils;

import java.util.Properties;

import com.digitalriver.worldpayments.api.PaymentPageHandler;
import com.digitalriver.worldpayments.api.security6.JKSKeyHandlerV6;

import io.drwp.demo.DemoApplication;

public class PaymentUtils {

    public static PaymentPageHandler getPaymentHandler() {
    	Properties prop = DemoApplication.getProperties();
        PaymentPageHandler handler = new PaymentPageHandler(new JKSKeyHandlerV6(prop.getProperty("device.rest.api.keystore.path"), prop.getProperty("device.rest.api.keystore.pwd"), "merchant", "ngcert"));
        return handler;
    }
    
}
