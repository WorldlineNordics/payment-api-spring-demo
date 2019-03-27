package com.worldline.payments.demo.merchant.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DemoConfiguration {

    @Value("${worldline.api.keystore.path}")
    public String keystorePath;

    @Value("${worldline.api.keystore.pwd}")
    public String keystorePwd;

    @Value("${worldline.api.key.merchantkeyalias}")
    public String merchantKeyAlias;

    @Value("${worldline.api.key.worldlinekeyalias}")
    public String worldlineKeyAlias;

    @Value("${worldline.api.merchantId}")
    public String merchantId;

    @Value("${worldline.api.posId}")
    public String posId;

    @Value("${worldline.api.url}")
    public String worldlineURL;
    
    @Value("${worldline.cardpayments.api.url}")
    public String worldlineCardPaymentsURL;
    
    @Value("${worldline.redirectpayments.api.url}")
    public String worldlineRedirectPaymentsURL;

}