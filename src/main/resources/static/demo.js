async function processAuthentication() {
  try {
    displayResult('Processing Initiate Authentication with Worldline.', '');
    var initResponse = await service
      .initAuth()
      .chdForm(document.getElementById('card_details'), 'data-chd')
      .send();
    if (initResponse.tDSMethodContent) {
      processTDSMethodContent(initResponse.tDSMethodContent);
      await timeout(3000);
    }
    if ('NOT_REQUIRED' == initResponse.authenticationStatus || 'SUCCESSFUL' == initResponse.authenticationStatus) {
      //proceed with existing payment and display result
      displayResult('Authentication Successful. Proceed with Payment', '');
      processCardAfterAuthentication(deviceAPIRequest, initResponse.worldlineSessionData);
    } else if ('CONTINUE' === initResponse.authenticationStatus) {
      //process with continue authentication
      displayResult('Processing Continue Authentication with Worldline.', '');
      var continueResponse = await service
        .continueAuth()
        .setWorldlineSessionData(initResponse.worldlineSessionData)
        .send();
      if ('SUCCESSFUL' === continueResponse.authenticationStatus) {
        //process with payment and display result
        displayResult('Authentication Successful. Proceed with Payment', '');
        processCardAfterAuthentication(deviceAPIRequest, continueResponse.worldlineSessionData);
      } else if ('REQUIRED' == continueResponse.authenticationStatus) {
        //rediect to ACS using iFrame
        displayResult('Processing Complete Authentication with Worldline.', '');
        processAuthenticationRedirect(continueResponse);
      }	else if (checkForPaymentAuthLevel(continueResponse.authenticationResult)) {
    	//process with payment for Non-authentication cases like ATTEMPTED, UNAVAILABLE and display result
    	displayResult('Authentication Attempted. Proceed with Payment', '');
        processCardAfterAuthentication(deviceAPIRequest, continueResponse.worldlineSessionData);
      } else {
        //Don't proceed for payment flow and show appropriate message to user.
        unpackResponse(continueResponse);
      }
    } else if ('REQUIRED' == initResponse.authenticationStatus) {
      //rediect to ACS using iFrame
      displayResult('Processing Complete Authentication with Worldline.', '');
      processAuthenticationRedirect(initResponse);
    } else if (checkForPaymentAuthLevel(initResponse.authenticationResult)) {
    	//process with payment for Non-authentication cases like ATTEMPTED, UNAVAILABLE and display result
    	displayResult('Authentication Attempted. Proceed with Payment', '');
        processCardAfterAuthentication(deviceAPIRequest, initResponse.worldlineSessionData);
    } else {
      //Don't proceed for payment flow and show appropriate message to user.
      unpackResponse(initResponse);
    }
  } catch (err) {
    showError(err);
  }
}

async function processCardAfterAuthentication(deviceAPIRequest, worldlineSessionData) {
  displayResult('Processing Payment with Worldline.', '');
  var response = await service
    .cardPayment()
    .setWorldlineSessionData(worldlineSessionData)
    .chdForm(document.getElementById('card_details'), 'data-chd')
    .send();
  displayResult('Processing result with merchant.', '');
  unpackResponse(response);
}

async function processCard(cardObj) {
  try {
    displayResult('Processing Payment with Worldline.', '');
    var response = await service
      .cardPayment()
      .card(cardObj)
      .send();
    displayResult('Processing result with merchant.', '');
    unpackResponse(response);
  } catch (err) {
    showError(err);
  }
}

async function initiateRedirect(pmMethodType) {
  try {
    displayResult('Processing Payment with Worldline.', '');
    if (pmMethodType == 'ibp') {
      var response = await service
        .redirectPayment()
        .paymentForm(document.getElementById('online_banking_details'), 'data-ibp')
        .send();
    } else if (pmMethodType == 'ewallet') {
      var response = await service
        .redirectPayment()
        .paymentForm(document.getElementById('ewallet_details'), 'data-ewallet')
        .send();
    }
    if (response.bankUrl) {
      displayResult("Redirecting to bank's site.", '');
      processRedirect(response);
    } else {
      //unpack response
      unpackResponse(response);
    }
  } catch (err) {
    showError(err);
  }
}

async function processEft() {
  try {
    displayResult('Processing Payment with Worldline.', '');
    var response = await service
      .eftPayment()
      .paymentForm(document.getElementById('eft_details'), 'data-eft')
      .send();
    displayResult('Processing result with merchant.', '');
    unpackResponse(response);
  } catch (err) {
    showError(err);
  }
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getPaymentMethods() {
  var response = await makeRequest({
    method: 'GET',
    url: '/api/demo/paymentMethodEndPoint'
  });
  try {
    var data = JSON.parse(response);
    service = new Worldline.PaymentService(data);
    var paymentMethods = await service.getIbpPaymentMethods().send();
    populateOptions('ibpList', paymentMethods);

    paymentMethods = await service.getEftPaymentMethods().send();
    populateOptions('eftList', paymentMethods);

    paymentMethods = await service.getEWalletPaymentMethods().send();
    populateOptions('ewalletList', paymentMethods);
  } catch (err) {
    showError(err);
  }
}

function populateOptions(paymentMethodList, paymentMethods) {
  if (paymentMethods == null) {
	var emptyList = document.getElementById(paymentMethodList);
	emptyList.style.display = "none";
	var submitButton = document.getElementById(paymentMethodList + 'Submit');
	submitButton.disabled = true;
  } else {
	var emptyListResult = document.getElementById(paymentMethodList + 'Result');
	emptyListResult.style.display = "none";
	paymentMethods.forEach(function(paymentMethod) {
      var list = document.getElementById(paymentMethodList);
      var opt = document.createElement('option');
      opt.value = paymentMethod.id;
      opt.text = paymentMethod.name;
      list.options.add(opt);
	});
  }
}

window.addEventListener(
  'message',
  function(e) {
    var key = e.message ? 'message' : 'data';
    var wlResponse = JSON.parse(e[key]);

    if ('AUTHENTICATION' === wlResponse.type) {
      var params = wlResponse.parameters;
      if ('SUCCESSFUL' === params.authenticationStatus) {
        displayResult('Authentication Successful. Proceed with Payment', '');
        processCardAfterAuthentication(deviceAPIRequest, params.worldlineSessionData);
      } else if (checkForPaymentAuthLevel(params.authenticationResult)) {
    	//process with payment for Non-authentication cases like ATTEMPTED, UNAVAILABLE and display result
    	displayResult('Authentication Attempted. Proceed with Payment', '');
        processCardAfterAuthentication(deviceAPIRequest, params.worldlineSessionData);
      } else {
        //Don't proceed for payment flow and show appropriate message to user.
        displayResult(
          'Order Id: ' +
            params.orderId +
            '<br>Authentication Status Description: ' +
            params.authenticationStatusDescription +
            '<br>Authentication Status: ' +
            params.authenticationStatus,
          ''
        );
      }
    } else {
      unpackResponse(wlResponse);
    }
    var redirectDiv = document.getElementById('iframeDiv');
    redirectDiv.removeChild(iframeDiv.childNodes[0]);
  },
  false
);
