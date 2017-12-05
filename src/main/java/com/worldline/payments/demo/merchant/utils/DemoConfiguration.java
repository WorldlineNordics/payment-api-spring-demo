package com.worldline.payments.demo.merchant.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource(value = { "application.properties" })
public class DemoConfiguration {

    @Value("${worldline.api.keystore.path}")
    public String keystorePath;

    @Value("${worldline.api.keystore.pwd}")
    public String keystorePwd;

    @Value("${worldline.api.key.merchantkeyalias}")
    public String merchantKeyAlias = "merchant";

    @Value("${worldline.api.key.worldlinekeyalias}")
    public String worldlineKeyAlias = "ngcert";

    @Value("${worldline.api.merchantId}")
    public String merchantId;

    @Value("${worldline.api.posId}")
    public String posId;

    @Value("${worldline.api.url}")
    public String worldlineURL;

}