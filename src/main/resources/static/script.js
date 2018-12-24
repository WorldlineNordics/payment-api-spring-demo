jQuery(document).ready(function($)
{
  
  $("#card_header").click(function(){
    $("#card_details").slideToggle();
  });  
  
  $("#online_banking_header").click(function(){
    $("#online_banking_details").slideToggle();
  }); 
});