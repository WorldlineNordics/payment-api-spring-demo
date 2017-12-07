package com.worldline.payments.demo.merchant;

public class UnpackResponse {
    private String status;
    private Long transactionId;
    private String orderId;
    
	public UnpackResponse(String status, Long transactionId, String orderId) {
		super();
		this.status = status;
		this.transactionId = transactionId;
		this.orderId = orderId;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Long getTransactionId() {
		return transactionId;
	}

	public void setTransactionId(Long transactionId) {
		this.transactionId = transactionId;
	}

	public String getOrderId() {
		return orderId;
	}

	public void setOrderId(String orderId) {
		this.orderId = orderId;
	}

}
