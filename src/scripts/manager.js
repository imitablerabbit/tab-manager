// HTML elements to be populated
var newForm;
var newUrlBox;
var links;
var tabCountSpan;
var filterInput;
var filterDiv;

// Global data
var config;
var tabs; 

// Initialise the global variables and load the config.
function init() {
	newForm = document.getElementById('new-tab-form');
	newUrlBox = document.getElementById('new-url');
	links = document.getElementById('links');
	tabCountSpan = document.getElementById("tabs-num");
	filterInput = document.getElementById("filter-text");
	filterDiv = document.getElementById("filter");
}

// Load the config from the local storage
function loadConfig(onConfigLoad) {
	chrome.storage.sync.get(onConfigLoad);
}

// Query all of the tabs and generate the list of tabs at the
// bottom of the extension page.
function getTabs() {
	chrome.tabs.query({
		windowId: chrome.windows.WINDOW_ID_CURRENT
	}, function (tabData) {
		tabs = tabData
		if (links == null) {
			console.log("Error: unable to populate links: links is null");
			return
		}
		filteredTabs = filterTabs(tabs);
		displayTabs(filteredTabs);
	});
}

function displayTabs(tabs) {
	setTabCount(tabs.length);
	while (links.firstChild) {
		links.removeChild(links.firstChild);
	}

	// Create a tab element for each of the tabs found
	for (var i = 0; i < tabs.length; i++) {
		var tabElement = createTabElement(tabs[i]);
		var hr = document.createElement("hr");
		links.appendChild(hr);
		links.appendChild(tabElement);
	}
}

function loadingTab(index) {
	var tabElement = links.querySelector("#tab-" + index + "");
	var tabLink = tabElement.querySelector(".tab-link");
	tabLink.innerText = generateTitle("Loading...");
}

function updateTab(index, tab) {
	var tabElement = links.querySelector("#tab-" + index + "");
	var newTabElement = createTabElement(tab);
	tabs[index] = tab; 
	tabElement.parentElement.replaceChild(newTabElement, tabElement);
}

function setTabCount(count) {
	tabCountSpan.innerHTML = count;
}

function createTabElement(tab) {
	let index = tab.index;
	var tabElement = document.createElement("div");
	tabElement.id = "tab-" + index.toString();
	tabElement.classList.add("tab");
	var tabHeader = document.createElement("div");
	tabHeader.classList.add("tab-header");
	var tabLink = createTabLink(index, tab)
	var closeButton = createTabCloseButton(index);
	var editButton = createTabEditButton(index);
	tabHeader.appendChild(tabLink);
	tabHeader.appendChild(editButton);
	tabHeader.appendChild(closeButton);
	tabElement.appendChild(tabHeader);
	return tabElement;
}

function createTabLink(index, tab) {
	var tabTitle = generateTitle(tab.title);
	var tabURL = tab.url;
	var tabLink = document.createElement("a");
	tabLink.id = index;
	tabLink.classList.add("tab-link");
	tabLink.href = "#"; // make the cursor a pointer
	tabLink.dataset.url = tabURL;
	tabLink.innerText = tabTitle;
	tabLink.onclick = function() {
		changeTab(index);
	};
	return tabLink;
}

function createTabCloseButton(index) {
	var closeLink = document.createElement("a");
	closeLink.href = "#";
	closeLink.innerText = "X";
	closeLink.classList.add("button");
	closeLink.classList.add("close");
	closeLink.onclick = function() {
		closeTab(index);
	}
	return closeLink;
}

function createTabEditButton(index) {
	var editLink = document.createElement("a");
	editLink.href = "#";
	editLink.innerText = "Edit";
	editLink.classList.add("button");
	editLink.classList.add("edit");
	editLink.onclick = function(event) {
		event.preventDefault();
		editTab(event.target.parentElement.parentElement, index); // lol this needs to change
	}
	return editLink;
}

// This will return the correct formation of the tab title to be displayed on 
// page
function generateTitle(tabTitle) {
	if (config.capitalisation === "uppercase") {
		tabTitle = tabTitle.toUpperCase();
	} else if (config.capitalisation === "lowercase") {
		tabTitle = tabTitle.toLowerCase();
	}
	if (config.titleShouldContract) {
		tabTitle = limitString(tabTitle, config.titleLength);
	}
	return tabTitle;
}

//This will reduce the number of characters in a string
function limitString(text, limitSize) {
	var textLength = text.length;
	text = text.substring(0, limitSize);
	if (textLength > limitSize - 3) {
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
	function onUpdated(id, data, tab) {
		if (tab.index == tabIndex && data.status == "loading") {
			loadingTab(tabIndex);
		}
		if (tab.index == tabIndex && data.status == "complete") {
			updateTab(tabIndex, tab);
			chrome.tabs.onUpdated.removeListener(onUpdated);
		}
	}
	chrome.tabs.query({
		windowId: chrome.windows.WINDOW_ID_CURRENT,
		index: tabIndex
	}, function (array) {
		chrome.tabs.onUpdated.addListener(onUpdated);
		chrome.tabs.update(array[0].id, {
			url: addHttp(newURL)
		});
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
	var editButton = li.querySelector(".button.edit");
	var tabLink = li.querySelector(".tab-link");
	var url = tabLink.dataset.url;

	// Create Edit form
	var editForm = document.createElement("form");
	editForm.id = "edit-form";

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
	f = function(event) {
		// event.preventDefault();
		var newURL = urlEdit.value;

		// Remove the form
		li.removeChild(editForm);
		editButton.innerText = "Edit";
		editFun = function() {
			editTab(tabElement, tabIndex);
		}
		editForm.onsubmit = editFun;
		editButton.onclick = editFun;

		// change the page location and reload the tabs
		if (newURL !== url) {
			changeLocation(parseInt(tabLink.id), newURL);
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

function showFilter() {
	if (config.filterShow) {
		filterDiv.style.display = "block";
		if (filterInput != null && config.filterShow) {
			filterInput.addEventListener("input", function() {
				filteredTabs = filterTabs(tabs);
				displayTabs(filteredTabs);
			});
		}
	} else {
		filterDiv.style.display = "none";
	}
}

function filterTabs(tabs) {
	var text = filterInput.value;
	var regex = new RegExp(text, "i");
	var filteredTabs = [];
	for (var i = 0; i < tabs.length; i++) {
		var tab = tabs[i];
		if (tab.title.search(regex) != -1) {
			filteredTabs.push(tab);
		}
	}
	return filteredTabs;
}

// Wait for the DOM to load before loading config.
window.addEventListener("load", function (evt) {
	init();
	loadConfig(function(c) {
		config = c
		showFilter();
		getTabs();

		// Add the event listener
		if (newForm != null) {
			newForm.addEventListener("submit", createTab);
		} else {
			console.log("FORM_ID could not be found!");
		}
	});
});
