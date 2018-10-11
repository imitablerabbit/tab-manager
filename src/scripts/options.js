// Config menu elements
var capitalisationDefaultRadio;
var capitalisationUppercaseRadio;
var capitalisationLowercaseRadio;
var titleShouldContractCheck;
var titleLengthNumber;
var filterShowCheck;

function init() {
    capitalisationDefaultRadio = document.getElementById("capitalisation-default");
    capitalisationUppercaseRadio = document.getElementById("capitalisation-uppercase");
    capitalisationLowercaseRadio = document.getElementById("capitalisation-lowercase");
    titleShouldContractCheck = document.getElementById("title-should-contract");
    titleLengthNumber = document.getElementById("title-length");
    filterShowCheck = document.getElementById("filter-show");
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
    if (config.filterShow != null) {
        filterShow = config.filterShow;
    }

    setCapitalisation(capitalisation);
    setTitleLength(titleShouldContract, titleLength);
    setFilterShow(filterShow);
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
    titleShouldContractCheck.checked = titleShouldContract;
    if (titleShouldContract) {
        titleLengthNumber.value = titleLength;
    } else {
        titleLengthNumber.disabled = true;
    }
}

function setFilterShow(filterShow) {
    filterShowCheck.checked = filterShow;
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
        titleLengthNumber.disabled = !checked;
    };
    titleShouldContractCheck.addEventListener("change", onTitleShouldContractChange);
    var onTitleLengthChange = function(event) {
        setConfig("titleLength", event.target.value);
    };
    titleLengthNumber.addEventListener("change", onTitleLengthChange);

    // Filtering options
    var onFilterShowChange = function(event) {
        setConfig("filterShow", event.target.checked);
    };
    filterShowCheck.addEventListener("change", onFilterShowChange);
});