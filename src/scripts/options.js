var capitalisation = "uppercase";
var titleShouldContract = true;
var titleLength = 15;

// Config menu elements
var capitalisationDefaultRadio;
var capitalisationUppercaseRadio;
var capitalisationLowercaseRadio;
var titleShouldContractCheck;
var titleLengthNumber;

function init() {
    capitalisationDefaultRadio = document.getElementById("capitalisation-default");
    capitalisationUppercaseRadio = document.getElementById("capitalisation-uppercase");
    capitalisationLowercaseRadio = document.getElementById("capitalisation-lowercase");
    titleShouldContractCheck = document.getElementById("title-should-contract");
    titleLengthNumber = document.getElementById("title-length");
}

function loadConfig(onConfigLoad) {
    chrome.storage.sync.get(onConfigLoad);
}

function onConfigLoad(config) {
    if (config.capitalisation != null) {
		capitalisation = config.capitalisation;
    }
    if (config.titleShouldContract != null) {
        titleShouldContract = config.titleShouldContract;
    }
	if (config.titleLength != null) {
		titleLength = config.titleLength;
	}

    setCapitalisation(capitalisation);
    setTitleLength(titleShouldContract, titleLength);
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

function setTitleLength(titleShouldContract, titleLength) {
    if (titleShouldContract) {
        titleShouldContractCheck.checked = true;
        titleLengthNumber.value = titleLength;
    } else {
        titleShouldContractCheck.checked = false;
        titleLengthNumber.disabled = true;
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

    // Capitalisation options
    var onCapitalisationChange = function(event) {
        setConfig("capitalisation", event.target.value);
    };
    capitalisationDefaultRadio.addEventListener("change", onCapitalisationChange);
    capitalisationUppercaseRadio.addEventListener("change", onCapitalisationChange);
    capitalisationLowercaseRadio.addEventListener("change", onCapitalisationChange);

    // Title length options
    var onTitleShouldContractChange = function(event) {
        var checked = event.target.checked;
        setConfig("titleShouldContract", checked);
        if (checked) {
            titleLengthNumber.disabled = false;
        } else {
            titleLengthNumber.disabled = true;
        }
    };
    titleShouldContractCheck.addEventListener("change", onTitleShouldContractChange);
    var onTitleLengthChange = function(event) {
        setConfig("titleLength", event.target.value);
    };
    titleLengthNumber.addEventListener("change", onTitleLengthChange);
});