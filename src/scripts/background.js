var defaultConfig = {
    capitalisation: "uppercase",
    titleShouldContract: true,
    titleLength: 15,
    filterShow: true
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.get(function(config) {
        missingConfig = {};
        for (key in defaultConfig) {
            if (config[key] == null) {
                missingConfig[key] = defaultConfig[key];
            }
        }
        chrome.storage.sync.set(missingConfig);
    });
});