// HTML elements to be populated
let newForm;
let newUrlBox;
let links;
let tabCountSpan;
let filterInput;
let filterDiv;

// Global data
let config;
let tabs; 

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

// Initialise the global letiables and load the config.
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


function getTabElementByIndex(index) {
	return links.querySelector("#tab-" + index.toString());
}

/**
 * Popup window creation
 */

function displayTabs(tabs) {
	setTabCount(tabs.length);
	while (links.firstChild) {
		links.removeChild(links.firstChild);
	}

	// Create a tab element for each of the tabs found
	for (let i = 0; i < tabs.length; i++) {
		let tabElement = createTabElement(tabs[i]);
		let hr = document.createElement("hr");
		links.appendChild(hr);
		links.appendChild(tabElement);
	}
}

function setTabCount(count) {
	tabCountSpan.innerHTML = count;
}

function updateTab(index, tab) {
	let tabElement = links.querySelector("#tab-" + index + "");
	let newTabElement = createTabElement(tab);
	tabs[index] = tab; 
	tabElement.parentElement.replaceChild(newTabElement, tabElement);
}

// Popup tab creation functions

function createTabElement(tab) {
	let index = tab.index;
	let tabElement = document.createElement("div");
	tabElement.id = "tab-" + index.toString();
	tabElement.classList.add("tab");
	let tabHeader = document.createElement("div");
	tabHeader.classList.add("tab-header");
	let tabLink = createTabLink(tab)
	let closeButton = createTabCloseButton(tab);
	let editButton = createTabEditButton(tab);
	tabHeader.appendChild(tabLink);
	tabHeader.appendChild(editButton);
	tabHeader.appendChild(closeButton);
	tabElement.appendChild(tabHeader);
	let editForm = createEditForm(tab);
	tabElement.appendChild(editForm);
	return tabElement;
}

function createTabLink(tab) {
	let tabTitle = generateTitle(tab.title);
	let tabURL = tab.url;
	let tabLink = document.createElement("a");
	tabLink.id = tab.index;
	tabLink.classList.add("tab-link");
	tabLink.href = "#"; // make the cursor a pointer
	tabLink.dataset.url = tabURL;
	tabLink.innerText = tabTitle;
	tabLink.onclick = function() {
		changeTab(tab.index);
	};
	return tabLink;
}

function createTabCloseButton(tab) {
	let closeLink = document.createElement("a");
	closeLink.href = "#";
	closeLink.innerText = "X";
	closeLink.classList.add("button");
	closeLink.classList.add("close");
	closeLink.onclick = function() {
		closeTab(tab.index);
	}
	return closeLink;
}

function createTabEditButton(tab) {
	let editLink = document.createElement("a");
	editLink.href = "#";
	editLink.innerText = "Edit";
	editLink.classList.add("button");
	editLink.classList.add("edit");
	editLink.onclick = function() {
		showEditForm(tab);
	}
	return editLink;
}

function createEditForm(tab) {
	let url = tab.url;

	// Create Edit form
	let editForm = document.createElement("form");
	editForm.classList.add("edit-form");
	editForm.style.display = "none";
	let urlEdit = document.createElement("input");
	urlEdit.type = "text";
	urlEdit.value = url;	
	urlEdit.name = "url";
	urlEdit.classList.add("edit-url");
	let urlEditLabel = document.createElement("label");
	urlEditLabel.setAttribute("for", "url");
	urlEditLabel.innerText = "URL:";
	let editSubmit = document.createElement("input");
	editSubmit.type = "submit";
	editSubmit.value = "";
	editSubmit.style.display = "none";

	editForm.addEventListener('submit', function(event) {
		event.preventDefault();
		submitEditTab(tab);
	});

	// Add everything to the form
	editForm.appendChild(urlEditLabel);
	editForm.appendChild(urlEdit);
	editForm.appendChild(editSubmit);
	return editForm;
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

// This will reduce the number of characters in a string
function limitString(text, limitSize) {
	let textLength = text.length;
	text = text.substring(0, limitSize);
	if (textLength > limitSize - 3) {
		text = text + "...";
	}
	return text;
}

/**
 * Tab creation functions
 */

// This will fire when the form is submitted
// It will create the new tab
function createTab(event) {
	event.preventDefault();
	let newTabData = {};
	if (newUrlBox.value != "") {
		newTabData.url = addHttp(newUrlBox.value);
	}
	chrome.tabs.create(newTabData, function () {});
}

function addHttp(url) {
	if (!url.startsWith("http://") && !url.startsWith("https://")) {
		url = "http://" + url;
	}
	return url;
}

/**
 * Edit form functions
 */

function showEditForm(tab) {
	let tabElement = getTabElementByIndex(tab.index);
	let editForm = tabElement.querySelector(".edit-form");
	editForm.style.display = "block";
	let editInput = tabElement.querySelector("input.edit-url");
	editInput.focus();
	let editButton = tabElement.querySelector(".button.edit");
	editButton.innerText = "Save";
	editButton.onclick = function() {
		submitEditTab(tab);
	}
}

function hideEditForm(tab) {
	let tabElement = getTabElementByIndex(tab.index);
	let editForm = tabElement.querySelector(".edit-form");
	editForm.style.display = "none";
	let editButton = tabElement.querySelector(".button.edit");
	editButton.innerText = "Edit";
	editButton.onclick = function() {
		showEditForm(tab);
	};
}

function submitEditTab(tab) {
	let tabElement = getTabElementByIndex(tab.index);
	let urlEdit = tabElement.querySelector(".edit-form .edit-url");
	let newURL = urlEdit.value;
	if (newURL !== tab.url) {
		changeLocation(tab.index, newURL);
	}
	hideEditForm(tab);
}

function loadingTab(index) {
	let tabElement = links.querySelector("#tab-" + index + "");
	let tabLink = tabElement.querySelector(".tab-link");
	tabLink.innerText = generateTitle("Loading...");
}

/**
 * Tab filtering functions
 */

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
	let text = filterInput.value;
	let regex = new RegExp(text, "i");
	let filteredTabs = [];
	for (let i = 0; i < tabs.length; i++) {
		let tab = tabs[i];
		if (tab.title.search(regex) != -1) {
			filteredTabs.push(tab);
		}
	}
	return filteredTabs;
}

/**
 * Chrome tab api functions
 */

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

// Close the indexed tab
function closeTab(tabIndex) {
	chrome.tabs.remove(tabs[tabIndex].id, function () {
		// Sleep until the tab is completely closed
		setTimeout(function () {
			getTabs();
		}, 100);
	});
}

// Change to the indexed tab
function changeTab(tabIndex) {
	chrome.tabs.update(tabs[tabIndex].id, {
		active: true
	}, function () {});
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