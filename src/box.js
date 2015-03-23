//Variables
var form;
var urlBox;
var checkbox;
var linksDiv;
var tabs;
var maxTitleLength = 16;

//This will initialize the variables
function init()
{
	form = document.getElementById('FORM_ID_NEW');
	urlBox = document.getElementById('URL');
	checkbox = document.getElementById('NEW_TAB_CHECKBOX');
	linksDiv = document.getElementById('LINKS');
	
	getTabs();
	
	//Add the event listener
	if(form != null)
	{
		form.addEventListener("submit", createTab);
		console.log("Event listener added successfully.");
	}
	else 
	{
		console.log("FORM_ID could not be found!");
	}
}

//This will produce a list of all the tabs at the bottom of pop-up
function getTabs()
{  
	//Get the tabs
	chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, function(array){
		tabs = array;
		var numOfTabs = tabs.length;				
		 
		//This will produce the list of tabs in the pop-up
		if(linksDiv != null)
		{
			var string = "";
			//Colors of google
			var colors = [
				"#0266C8",
				"#F90101",
				"#F2B50F", 
				"#0266C8",
				"#00933B",
				"#F90101"
			];
			
			//Show the number of open tabs
			var tabNum = document.getElementById("tabs");
			tabNum.innerHTML = "TABS: " + numOfTabs.toString();
			
			//Add the html for each tab
			for(var i = 0; i < numOfTabs; i++)
			{
				//Limit the size of the title
				var tabTitle = tabs[i].title.toUpperCase();
				var tabTitleShort = limitString(tabTitle);
				
				//Create the links to each tab
				string = string + "<hr><li><a href=\"#\" id=\""+ i +"\" style=\"color: " +
						colors[i%colors.length] + "\" title=\"" + tabTitle + "\">" + tabTitleShort + 
						"</a></li><a href=\"#\" class=\"close_button\">x</a>";
			}
			linksDiv.innerHTML = "<ul>" + string + "</ul>";			
			
			//Find all the close buttons
			var closeButtons = document.getElementsByClassName("close_button");
			
			//Gets the links and adds a click listener
			for(var i = 0; i < numOfTabs; i++)
			{
				//Add the tab changer link
				var link = document.getElementById(i.toString());
				
				if(link != null)
				{					
					//This is needed to make sure the tab isn't changed straight away and has parameters
					var f = function(i){return function(){changeTab(i);};};
					link.onclick = f(i);
				}
				else
				{
					console.log("Could not find the link in the HTML");
				}
				
				//Add the tab closer link				
				if(closeButtons[i] != null)
				{					
					//This is needed to make sure the tab isn't changed straight away and has parameters
					var f = function(i){return function(){closeTab(i);};};
					closeButtons[i].onclick = f(i);
				}
				else
				{
					console.log("Could not find the link in the HTML");
				}
			}
		} 
		else
		{
			console.log("Could not find links");
		}
	});
}

//This will reduce the number of characters in a string
function limitString(text)
{
	var textLength = text.length;
	var newString = "";
	
	for(var i = 0; (i < maxTitleLength) && (i < textLength); i++)
	{
		newString = newString + text[i];
	}
	
	if(textLength > maxTitleLength)
	{
		newString = newString + "...";
	}
	
	return newString;
}

//This will fire when the form is submitted
//It will create the new tab
function createTab()
{
	//Check whether the user entered http://
	var httpString = "http://";
	var startString = urlBox.value.substring(0, 7);
	var urlPath = "";
	
	if(startString != httpString)
	{
		urlPath = "http://www.";
	}

	urlPath = urlPath + urlBox.value;

	//check if the page should be a new tab
	if(checkbox.checked == 1)
	{
		chrome.tabs.create({url: urlPath}, function(){});
	}
	else
	{
		chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT, active: true}, function(array){
			chrome.tabs.update(array[0].id, {url: urlPath}, function(){});			
			console.log("Closing window...");
			window.close();
		});
	}
	
}

//Change to the indexed tab
function changeTab(tabIndex)
{
	chrome.tabs.update(tabs[tabIndex].id, {active: true}, function(){});
}

//Close the indexed tab
function closeTab(tabIndex)
{
	chrome.tabs.remove(tabs[tabIndex].id, function(){
		//Sleep until the tab is completely closed
		setTimeout(function(){getTabs();}, 100);
	});
}

//This will wait for the page to load and will then
//call init()
window.addEventListener("load", function(evt)
{
	init();
});

