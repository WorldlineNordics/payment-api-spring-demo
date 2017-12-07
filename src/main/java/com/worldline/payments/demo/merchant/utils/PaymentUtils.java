package com.worldline.payments.demo.merchant.utils;

import com.digitalriver.worldpayments.api.security6.JKSKeyHandlerV6;
import com.worldline.payments.api.PaymentHandler;

public class PaymentUtils {

    public static PaymentHandler getPaymentHandler(DemoConfiguration props) {
        return new PaymentHandler(new JKSKeyHandlerV6(props.keystorePath,
                props.keystorePwd,
                props.merchantKeyAlias,
                props.worldlineKeyAlias));
    }

}
