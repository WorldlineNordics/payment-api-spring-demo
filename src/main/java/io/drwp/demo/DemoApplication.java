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
		InputStream input = null;

		try {
			
			input = new FileInputStream("src/main/resources/devicerestapi.properties");
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
