package com.worldline.payments.demo.merchant;

import com.worldline.payments.api.PaymentResponse;

public class UnpackResponse {
    private PaymentResponse response;
    private String requestStatus;
    
	public UnpackResponse(PaymentResponse response, String requestStatus) {
		this.response = response;
		this.requestStatus = requestStatus;
	}

	public PaymentResponse getResponse() {
		return response;
	}

	public void setResponse(PaymentResponse response) {
		this.response = response;
	}

	public String getRequestStatus() {
		return requestStatus;
	}

	public void setRequestStatus(String requestStatus) {
		this.requestStatus = requestStatus;
	}

}
