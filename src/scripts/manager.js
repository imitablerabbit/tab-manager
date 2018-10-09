//Variables
var newForm;
var newUrlBox;
var linksDiv;
var tabs;
var maxTitleLength = 16;
var capitalisation;

//This will initialize the variables
function init() {
	newForm = document.getElementById('new_tab_form');
	newUrlBox = document.getElementById('new_url');
	linksDiv = document.getElementById('links');

	chrome.storage.sync.get("capitalisation", function(items) {
		capitalisation = items.capitalisation;
		getTabs();		

		//Add the event listener
		if (newForm != null) {
			newForm.addEventListener("submit", createTab);
			console.log("Event listener added successfully.");
		} else {
			console.log("FORM_ID could not be found!");
		}
	});

}

//This will produce a list of all the tabs at the bottom of pop-up
function getTabs() {
	//Get the tabs
	chrome.tabs.query({
		windowId: chrome.windows.WINDOW_ID_CURRENT
	}, function (array) {
		tabs = array;
		var numOfTabs = tabs.length;

		//This will produce the list of tabs in the pop-up
		if (linksDiv != null) {
			var string = "";

			// Show the number of open tabs
			var tabNum = document.getElementById("tabs-num");
			tabNum.innerHTML = numOfTabs.toString();

			// Add the html for each tab
			for (var i = 0; i < numOfTabs; i++) {
				// Limit the size of the title
				var tabTitle = tabs[i].title;
				var tabTitleShort = generateTitle(tabTitle);

				var tabURL = tabs[i].url;

				// Create the links to each tab
				string = string + "<hr><li id='tab-" + i + "'><a href='#' id='" + i + "' class='tab' title='" + tabTitle + "' data-url='" + tabURL + "'>" + tabTitleShort +
					"</a><a class='close_button'>x</a><a class='edit_button'>Edit</a></li>";
			}
			linksDiv.innerHTML = "<ul>" + string + "</ul>";

			//Find all the close buttons
			var closeButtons = document.getElementsByClassName("close_button");
			var editButtons = document.getElementsByClassName("edit_button");

			//Gets the links and adds a click listener
			for (var i = 0; i < numOfTabs; i++) {
				//Add the tab changer link
				var link = document.getElementById(i.toString());

				if (link != null) {
					//This is needed to make sure the tab isn't changed straight away and has parameters
					var f = function (i) {
						return function () {
							changeTab(i);
						};
					};
					link.onclick = f(i);
				} else {
					console.log("Could not find the link in the HTML");
				}

				// Add the edit buttons functionality			
				if (editButtons[i] != null) {
					//This is needed to make sure the tab isn't changed straight away and has parameters
					var f = function (i) {
						return function () {
							editTab(i);
						};
					};
					editButtons[i].onclick = f(i);
				} else {
					console.log("Could not find the link in the HTML");
				}

				//Add the tab closer link				
				if (closeButtons[i] != null) {
					//This is needed to make sure the tab isn't changed straight away and has parameters
					var f = function (i) {
						return function () {
							closeTab(i);
						};
					};
					closeButtons[i].onclick = f(i);
				} else {
					console.log("Could not find the link in the HTML");
				}
			}
		} else {
			console.log("Could not find links");
		}
	});
}

// This will return the correct formation of the tab title to be displayed on 
// page
function generateTitle(tabTitle) {
	// Get whether the title should be uppercase, lowercase, default or 
	// sentence case
	if (capitalisation === "uppercase") {
		tabTitle = tabTitle.toUpperCase();
	} else if (capitalisation === "lowercase") {
		tabTitle = tabTitle.toLowerCase();
	}

	// Shorten the title
	return limitString(tabTitle, maxTitleLength);
}

//This will reduce the number of characters in a string
function limitString(text, limitSize) {
	var textLength = text.length;
	var newString = "";

	for (var i = 0;
		(i < limitSize) && (i < textLength); i++) {
		newString = newString + text[i];
	}

	if (textLength > limitSize) {
		newString = newString + "...";
	}

	return newString;
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
function editTab(tabIndex) {

	// Get the tab list item and edit button
	var li = document.getElementById("tab-"+tabIndex);
	var editButton = liEditButton = li.querySelector(".edit_button");
	var tabLink = li.querySelector(".tab");
	var url = tabLink.dataset.url;

	// // Create Edit form
	var editForm = document.createElement("form");
	editForm.id = "edit_form";

	// var titleEdit = document.createElement("input");
	// titleEdit.type = "text";
	// titleEdit.value = tabLink.title;
	// titleEdit.name = "title";
	// titleEdit.id = "title";
	// var titleEditLabel = document.createElement("Label");
	// titleEditLabel.setAttribute("for", "title");
	// titleEditLabel.innerText = "TITLE:";

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
	// editForm.appendChild(titleEditLabel);
	// editForm.appendChild(titleEdit);
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
		// var newTitle = titleEdit.value;

		// // Set the new title
		// var newTitleShort = limitString(newTitle, maxTitleLength);
		// tabLink.title = newTitle;
		// tabLink.innerText = newTitleShort;

		// Set the new URL
		if (newURL !== url) {
			changeLocation(parseInt(tabLink.id), newURL);
		}

		// Remove the form
		li.removeChild(editForm);

		// Change it back to save
		editButton.innerText = "Edit";
		editButton.onclick = function() {
			editTab(tabIndex);
		}
	}
	editButton.onclick = f;
	editForm.addEventListener('submit', f);
}

// Close the indexed tab
function closeTab(tabIndex) {
	chrome.tabs.remove(tabs[tabIndex].id, function () {
		//Sleep until the tab is completely closed
		setTimeout(function () {
			getTabs();
		}, 100);
	});
}

//This will wait for the page to load and will then
//call init()
window.addEventListener("load", function (evt) {
	init();
});
