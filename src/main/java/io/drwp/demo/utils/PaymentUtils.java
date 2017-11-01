package io.drwp.demo.utils;

import java.util.Properties;

import com.digitalriver.worldpayments.api.PaymentPageHandler;
import com.digitalriver.worldpayments.api.security6.JKSKeyHandlerV6;

import io.drwp.demo.DemoApplication;

public class PaymentUtils {

    public static PaymentPageHandler getPaymentHandler() {
    	Properties prop = DemoApplication.prop;
        PaymentPageHandler handler = new PaymentPageHandler(new JKSKeyHandlerV6(prop.getProperty("path"), prop.getProperty("pwd"), "merchant", "ngcert"));
        return handler;
    }
    
}
