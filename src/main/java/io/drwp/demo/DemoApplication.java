package io.drwp.demo;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

	private static Properties prop;

	public static void main(String[] args) {

		loadPropertyFile();
		SpringApplication.run(DemoApplication.class, args);
	}
	
	public static Properties getProperties() {
	    if(prop == null) {
	       loadPropertyFile();
	    }
	    return prop;
	}

	private static void loadPropertyFile() {
		prop = new Properties();
		InputStream input = null;

		try {

			input = new FileInputStream("src/main/config/application.properties");
			prop.load(input);
			
		} catch (IOException ex) {
			ex.printStackTrace();
		} finally {
			if (input != null) {
				try {
					input.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}

	}

}
