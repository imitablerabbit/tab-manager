var capitalisation = "uppercase";
var titleLength = 15;

// Config menu elements
var capitalisationDefaultRadio;
var capitalisationUppercaseRadio;
var capitalisationLowercaseRadio;
var titleLengthNumber;

function init() {
    capitalisationDefaultRadio = document.getElementById("capitalisation-default");
    capitalisationUppercaseRadio = document.getElementById("capitalisation-uppercase");
    capitalisationLowercaseRadio = document.getElementById("capitalisation-lowercase");
    titleLengthNumber = document.getElementById("title-length");
}

function loadConfig(onConfigLoad) {
    chrome.storage.sync.get(onConfigLoad);
}

function onConfigLoad(config) {
    if (config.capitalisation != null) {
		capitalisation = config.capitalisation;
	}
	if (config.titleLength != null) {
		titleLength = config.titleLength;
	}

    setCapitalisation(capitalisation);
    setTitleLength(titleLength);
}

function setCapitalisation(capitalisation) {
    if (capitalisation == "uppercase") {
        capitalisationUppercaseRadio.checked = true;
    } else if (capitalisation == "lowercase") {
        capitalisationLowercaseRadio.checked = true;
    } else {
        capitalisationDefaultRadio.checked = true;
    }
}

function setTitleLength(titleLength) {
    if (titleLength != null) {
        titleLengthNumber.value = titleLength;
    }
}

function setConfig(key, value) {
    data = {};
    data[key] = value;
    chrome.storage.sync.set(data);
}

window.addEventListener("load", function (evt) {
    init();
    loadConfig(onConfigLoad);

    // Add the listeners for the different options
    var onCapitalisationChange = function(event) {
        setConfig("capitalisation", event.target.value);
    };
    capitalisationDefaultRadio.addEventListener("change", onCapitalisationChange);
    capitalisationUppercaseRadio.addEventListener("change", onCapitalisationChange);
    capitalisationLowercaseRadio.addEventListener("change", onCapitalisationChange);
    var onTitleLengthChange = function(event) {
        setConfig("titleLength", event.target.value);
    };
    titleLengthNumber.addEventListener("change", onTitleLengthChange);
});

