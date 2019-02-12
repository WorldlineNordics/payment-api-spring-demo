package com.worldline.payments.demo.merchant;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.ws.rs.GET;
import javax.ws.rs.POST;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DeviceRestApiController {

	/*This mapping would return the payment page; in case of redirect, once the bank's processing is completed, 
	 * user would be redirected back to payment page which could be either GET or POST. For this application index.html is the payment page.*/
	
	@POST
	@GET
	@RequestMapping(value={"","/","index"})
	public String paymentPage(){
		try {
			return getFileData("static/index.html");
		} catch (URISyntaxException ex){
			ex.printStackTrace();
			return "Failed to load the payment page";			
		}catch (IOException ex) {
			ex.printStackTrace();
			return "Failed to load the payment page";		
		}
	}
	
	private String getFileData(String fileName) throws URISyntaxException, IOException{
		Path path = Paths.get(getClass().getClassLoader().getResource(fileName).toURI());
		Stream<String> lines = Files.lines(path);
		String data = lines.collect(Collectors.joining("\n"));
		lines.close();
		return data;
	}

}
