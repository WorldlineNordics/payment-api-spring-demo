package com.worldline.payments.demo.merchant;

import java.math.BigDecimal;

public class RegistrationData {
	
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
    String shippingFullName;
    String shippingCompanyName;
    String shippingEmailAddress;
    String shippingAddressLine1;
    String shippingAddressLine2;
    String shippingCity;
    String shippingStateProvince;
    String shippingZipCode;
    String shippingCountryCode;
    String shippingMobilePhone;
    String accId;
    String accType;
    String transType;
    String sdkAppId;
    String purchaseInstallment;
    String messageCategory;
    String challengeWindowSize;
    String orderId;
    String referenceTransactionId;
    String paymentAuthenticationLevel;
    
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
    
    public String getShippingFullName() {
        return shippingFullName;
    }
    
    public String getShippingCompanyName() {
        return shippingCompanyName;
    }
    
    public String getShippingEmailAddress() {
        return shippingEmailAddress;
    }
    
    public String getShippingAddressLine1() {
        return shippingAddressLine1;
    }
    
    public String getShippingAddressLine2() {
        return shippingAddressLine2;
    }
    
    public String getShippingCity() {
        return shippingCity;
    }
    
    public String getShippingStateProvince() {
        return shippingStateProvince;
    }
    
    public String getShippingZipCode() {
        return shippingZipCode;
    }
    
    public String getShippingCountryCode() {
        return shippingCountryCode;
    }
    
    public String getShippingMobilePhone() {
        return shippingMobilePhone;
    }
    
    public String getAccId() {
		return accId;
	}

	public String getAccType() {
		return accType;
	}

	public String getTransType() {
		return transType;
	}

	public String getSdkAppId() {
		return sdkAppId;
	}

	public String getPurchaseInstallment() {
		return purchaseInstallment;
	}

	public String getMessageCategory() {
		return messageCategory;
	}

	public String getChallengeWindowSize() {
		return challengeWindowSize;
	}
	
	public String getOrderId() {
		return orderId;
	}

	public String getReferenceTransactionId() {
		return referenceTransactionId;
	}
	
	public String getPaymentAuthenticationLevel() {
		return paymentAuthenticationLevel;
	}
}
