package com.worldline.payments.demo.merchant.utils;

import com.worldline.payments.demo.merchant.RegistrationEndpoint;
import org.glassfish.jersey.server.ResourceConfig;
import org.springframework.stereotype.Component;

import javax.ws.rs.ApplicationPath;

@Component
@ApplicationPath("/api")
public class JerseyConfig extends ResourceConfig {
    public JerseyConfig() {
        registerEndpoints();
    }

    private void registerEndpoints() {
        register(RegistrationEndpoint.class);
    }
}