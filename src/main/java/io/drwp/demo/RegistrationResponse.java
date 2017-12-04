package io.drwp.demo;

public class RegistrationResponse {
    private String encryptedPayload;
    private boolean alreadyRegistered;
    private String path;

    public RegistrationResponse(String encryptedPayload, boolean alreadyRegistered, String path) {
        this.encryptedPayload = encryptedPayload;
        this.alreadyRegistered = alreadyRegistered;
        this.path = path;
    }
    
    public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public String getEncryptedPayload() {
        return encryptedPayload;
    }

    public void setEncryptedPayload(String encryptedPayload) {
        this.encryptedPayload = encryptedPayload;
    }

    public boolean isAlreadyRegistered() {
        return alreadyRegistered;
    }

    public void setAlreadyRegistered(boolean alreadyRegistered) {
        this.alreadyRegistered = alreadyRegistered;
    }
}
