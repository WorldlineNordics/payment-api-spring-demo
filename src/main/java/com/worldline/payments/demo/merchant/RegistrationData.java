package com.worldline.payments.demo.merchant;

import java.math.BigDecimal;

public class RegistrationData {
    public String getBillingAddressLine1() {
        return billingAddressLine1;
    }

    public String getBillingAddressLine2() {
        return billingAddressLine2;
    }

    public String getBillingCity() {
        return billingCity;
    }

    public String getBillingZipCode() {
        return billingZipCode;
    }

    public String getBillingStateProvince() {
        return billingStateProvince;
    }

    public String getBillingCountryCode() {
        return billingCountryCode;
    }

    public String getBillingEmailAddress() {
        return billingEmailAddress;
    }

    public String getBillingBuyerType() {
        return billingBuyerType;
    }

    public String getBillingFullName() {
        return billingFullName;
    }

    public String getBirthDate() {
        return birthDate;
    }

    public String getBillingBuyerVATNumber() {
        return billingBuyerVATNumber;
    }

    public String getBillingMobilePhone() {
        return billingMobilePhone;
    }

    public String getDemoCurrency() {
        return demoCurrency;
    }

    public BigDecimal getDemoAmount() {
        return demoAmount;
    }

    public String getDemoTransactionChannel() {
        return demoTransactionChannel;
    }

    public String getDemoAutoCapture() {
        return demoAutoCapture;
    }

    public String getDemoTokenization() {
        return demoTokenization;
    }
    
    public String getPaymentType(){
    	return paymentType;
    }

    String billingAddressLine1;
    String billingAddressLine2;
    String billingCity;
    String billingZipCode;
    String billingStateProvince;
    String billingCountryCode;
    String billingEmailAddress;
    String billingBuyerType;
    String billingFullName;
    String birthDate;
    String billingBuyerVATNumber;
    String billingMobilePhone;
    String demoCurrency;
    BigDecimal demoAmount;
    String demoTransactionChannel;
    String demoAutoCapture;
    String demoTokenization;
    String paymentType;
}
