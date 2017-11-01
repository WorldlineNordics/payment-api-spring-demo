package io.drwp.demo;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

	public static Properties prop;

	public static void main(String[] args) {

		loadPropertyFile();
		SpringApplication.run(DemoApplication.class, args);
	}

	private static void loadPropertyFile() {
		prop = new Properties();
		InputStream input1 = null, input2 = null;

		try {
			
			input1 = new FileInputStream("src/main/resources/devicerestapi.properties");
			prop.load(input1);
			input2 = new FileInputStream("src/main/resources/jskkeyhandlerv6.properties");
			Properties prop2 = new Properties(); 
			prop2.load(input2);
			prop.putAll(prop2);
			
		} catch (IOException ex) {
			ex.printStackTrace();
		} finally {
			if (input1 != null && input2 != null) {
				try {
					input1.close();
					input2.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}

	}

}
