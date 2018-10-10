// HTML elements to be populated
var newForm;
var newUrlBox;
var linksDiv;
var tabCountSpan;

// Global config options
// There should be some way of syncing these to the config options
// and remove a need for defaults everywhere
var titleShouldContract = true;
var maxTitleLength = 15;
var capitalisation = "uppercase";

// The tab data
var tabs; 

// Initialise the global variables and load the config.
function init() {
	newForm = document.getElementById('new-tab-form');
	newUrlBox = document.getElementById('new-url');
	linksDiv = document.getElementById('links');
	tabCountSpan = document.getElementById("tabs-num");
}

// Load the config from the local storage
function loadConfig(onConfigLoad) {
	chrome.storage.sync.get(onConfigLoad);
}

// Set the global config so it can be used in the rest of the script
function setGlobalConfig(config) {
	if (config.capitalisation != null) {
		capitalisation = config.capitalisation;
	}
	if (config.titleLength != null) {
		maxTitleLength = config.titleLength;
	}
	if (config.titleShouldContract != null) {
		titleShouldContract = config.titleShouldContract;
	}
}

// Query all of the tabs and generate the list of tabs at the
// bottom of the extension page.
function getTabs() {
	chrome.tabs.query({
		windowId: chrome.windows.WINDOW_ID_CURRENT
	}, function (tabData) {
		tabs = tabData
		if (linksDiv == null) {
			console.log("Error: unable to populate linksDiv: linksDiv is null");
			return
		}
		setTabCount(tabs.length);
		while (linksDiv.firstChild) {
			linksDiv.removeChild(linksDiv.firstChild);
		}

		// Create a tab element for each of the tabs found
		var linksUl = document.createElement("ul"); 
		for (var i = 0; i < tabs.length; i++) {
			var tabElement = createTabElement(i, tabs[i]);
			var hr = document.createElement("hr");
			linksUl.appendChild(hr);
			linksUl.appendChild(tabElement);
		}
		linksDiv.appendChild(linksUl);
	});
}

function setTabCount(count) {
	tabCountSpan.innerHTML = count;
}

function createTabElement(index, tab) {
	var tabTitle = generateTitle(tab.title);
	var tabURL = tab.url;
	var tabElement = document.createElement("li");
	var tabLink = document.createElement("a");
	var closeButton = createTabCloseButton(index);
	var editButton = createTabEditButton(index);
	tabElement.id = "tab-" + index.toString();
	tabLink.id = index;
	tabLink.href = "#"; // make the cursor a pointer
	tabLink.classList.add("tab");
	tabLink.dataset.url = tabURL;
	tabLink.innerText = tabTitle;
	tabLink.onclick = function() {
		changeTab(index);
	};
	tabElement.appendChild(tabLink);
	tabElement.appendChild(closeButton);
	tabElement.appendChild(editButton);
	return tabElement;
}

function createTabCloseButton(index) {
	var closeLink = document.createElement("a");
	closeLink.href = "#";
	closeLink.innerText = "x";
	closeLink.classList.add("close-button");
	closeLink.onclick = function() {
		closeTab(index);
	}
	return closeLink;
}

function createTabEditButton(index) {
	var editLink = document.createElement("a");
	editLink.href = "#";
	editLink.innerText = "Edit";
	editLink.classList.add("edit-button");
	editLink.onclick = function(event) {
		editTab(event.target.parentElement, index);
	}
	return editLink;
}

// This will return the correct formation of the tab title to be displayed on 
// page
function generateTitle(tabTitle) {
	if (capitalisation === "uppercase") {
		tabTitle = tabTitle.toUpperCase();
	} else if (capitalisation === "lowercase") {
		tabTitle = tabTitle.toLowerCase();
	}
	if (titleShouldContract) {
		tabTitle = limitString(tabTitle, maxTitleLength);
	}
	return tabTitle;
}

//This will reduce the number of characters in a string
function limitString(text, limitSize) {
	var textLength = text.length;
	text = text.substring(0, limitSize);
	if (textLength > limitSize) {
		text = text + "...";
	}
	return text;
}

function addHttp(url) {
	if (!url.startsWith("http://") && !url.startsWith("https://")) {
		url = "http://" + url;
	}
	return url;
}

//This will fire when the form is submitted
//It will create the new tab
function createTab(event) {
	event.preventDefault();
	var newTabData = {};
	if (newUrlBox.value != "") {
		newTabData.url = addHttp(newUrlBox.value);
	}
	chrome.tabs.create(newTabData, function () {});
}

// Changes the location of the tab with the specified index to the new url.
function changeLocation(tabIndex, newURL) {
	chrome.tabs.query({
		windowId: chrome.windows.WINDOW_ID_CURRENT,
		index: tabIndex
	}, function (array) {
		chrome.tabs.update(array[0].id, {
			url: addHttp(newURL)
		}, function () {});
		console.log("Closing window...");
		window.close();
	});
}

// Change to the indexed tab
function changeTab(tabIndex) {
	chrome.tabs.update(tabs[tabIndex].id, {
		active: true
	}, function () {});
}

// Change data relating to the tab specified
function editTab(tabElement, tabIndex) {

	// Get the tab list item and edit button
	var li = tabElement
	var editButton = liEditButton = li.querySelector(".edit-button");
	var tabLink = li.querySelector(".tab");
	var url = tabLink.dataset.url;

	// Create Edit form
	var editForm = document.createElement("form");
	editForm.id = "edit_form";

	var urlEdit = document.createElement("input");
	urlEdit.type = "text";
	urlEdit.value = url;	
	urlEdit.name = "url";
	urlEdit.id = "url";

	var urlEditLabel = document.createElement("Label");
	urlEditLabel.setAttribute("for", "url");
	urlEditLabel.innerText = "URL:";

	var editSubmit = document.createElement("input");
	editSubmit.type = "submit";
	editSubmit.value = "";
	editSubmit.style.display = "none";

	// Add everything to the form
	editForm.appendChild(urlEditLabel);
	editForm.appendChild(urlEdit);
	editForm.appendChild(editSubmit);
	li.appendChild(editForm);

	urlEdit.focus();

	// Change the edit button to represent the new save button
	editButton.innerText = "Save";
	f = function(e) {
		e.preventDefault();

		// Handle the edit form submission
		var newURL = urlEdit.value;

		// Set the new URL
		if (newURL !== url) {
			changeLocation(parseInt(tabLink.id), newURL);
		}

		// Remove the form
		li.removeChild(editForm);

		// Change it back to save
		editButton.innerText = "Edit";
		editButton.onclick = function() {
			editTab(tabElement, tabIndex);
		}
	}
	editButton.onclick = f;
	editForm.addEventListener('submit', f);
}

// Close the indexed tab
function closeTab(tabIndex) {
	chrome.tabs.remove(tabs[tabIndex].id, function () {
		// Sleep until the tab is completely closed
		setTimeout(function () {
			getTabs();
		}, 100);
	});
}

// Wait for the DOM to load before loading config.
window.addEventListener("load", function (evt) {
	init();
	loadConfig(function(config) {
		setGlobalConfig(config);
		getTabs();

		// Add the event listener
		if (newForm != null) {
			newForm.addEventListener("submit", createTab);
			console.log("Event listener added successfully.");
		} else {
			console.log("FORM_ID could not be found!");
		}
	});
});
