package io.drwp.demo;

public class RegistrationResponse {
    private String encryptedPayload;
    private boolean alreadyRegistered;

    public RegistrationResponse(String encryptedPayload, boolean alreadyRegistered) {
        this.encryptedPayload = encryptedPayload;
        this.alreadyRegistered = alreadyRegistered;
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
