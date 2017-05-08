window.addEventListener("load", function (evt) {

    // Check to see what the current options are
    chrome.storage.sync.get("capitalisation", function(items){
        var radio = document.getElementById("capitalisation_"+items.capitalisation);
        radio.checked = true; 
    });
	
    // Add the listeners for the different options
    var capFunc = function(event) {
        chrome.storage.sync.set({
            capitalisation: event.target.value
        }, function(){});
    }
    var capDefault = document.getElementById("capitalisation_default");
    capDefault.addEventListener("change", capFunc);
    var capUpper = document.getElementById("capitalisation_uppercase");
    capUpper.addEventListener("change", capFunc);
    var capLower = document.getElementById("capitalisation_lowercase");
    capLower.addEventListener("change", capFunc);

});