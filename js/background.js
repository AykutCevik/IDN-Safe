const blockedTabs = [];
const blockedDomainsByTabs = [];
const allowedDomains = [];

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {

    switch (request.type) {
        case REQ_BLOCKED_URLS:
            var result = {list: blockedDomainsByTabs[request.tabId]};
            sendResponse(result);
            break;
        case REQ_ALLOW_ALWAYS:
            whitelistDomains(request.list);
        case REQ_ALLOW_TEMPORARILY:
            request.list.forEach(function (domain) {
                allowedDomains.push(domain);
            });
            sendResponse(null);
            break;
        case REQ_REMOVE_FROM_WHITELIST:
            deWhitelistDomains(request.list, sendResponse);
            break;
        case REQ_REVOKE_FROM_TEMP_LIST:
            revokeTemporarilyAllowed();
            sendResponse(null);
            break;
    }
});

chrome.webRequest.onBeforeRequest.addListener(function (data) {

        if (data.type === REQ_MAIN_FRAME) {
            delete blockedTabs[data.tabId];
            delete blockedDomainsByTabs[data.tabId];
        }

        var block = (data.url.indexOf("xn--") !== -1);
        if (block) {

            var domain = extractDomainFromURL(data.url);
            if (allowedDomains.indexOf(domain) > -1) {
                return {cancel: false};
            }

            console.log("Blocked " + data.url);

            var tabId = data.tabId;

            if (blockedTabs.indexOf(tabId) === -1) {
                blockedTabs[tabId] = 0;
                blockedDomainsByTabs[tabId] = [];
            }

            blockedTabs[tabId] = blockedTabs[tabId] + 1;
            if (blockedDomainsByTabs[tabId].indexOf(domain) === -1) {
                blockedDomainsByTabs[tabId].push(domain);
            }

            updateTabIcon(tabId);
        }

        return {cancel: block};
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
);

function revokeTemporarilyAllowed() {
    allowedDomains.length = 0;
    loadWhitelist();
}

function deWhitelistDomains(domains, successHandler) {
    chrome.storage.local.get('whiteListedDomains', function (object) {

        const whitelistedDomains = [];

        if (object.whiteListedDomains) {
            object.whiteListedDomains.forEach(function (domain) {
                if (domains.indexOf(domain) === -1) {
                    whitelistedDomains.push(domain);
                }

                var index = allowedDomains.indexOf(domain);
                if (index !== -1) {
                    allowedDomains.splice(index);
                }
            });
        }
        chrome.storage.local.set({whiteListedDomains: whitelistedDomains}, successHandler);
    });
}

function whitelistDomains(domains) {
    chrome.storage.local.get('whiteListedDomains', function (object) {

        const whitelistedDomains = [];

        if (object.whiteListedDomains) {
            object.whiteListedDomains.forEach(function (domain) {
                whitelistedDomains.push(domain);
            });
        }
        domains.forEach(function (domain) {
            whitelistedDomains.push(domain);
        });

        chrome.storage.local.set({whiteListedDomains: whitelistedDomains});
    });
}

function updateTabIcon(tabId) {
    if (blockedTabs[tabId]) {
        chrome.browserAction.setIcon({tabId: tabId, path: "../img/icon_red_48.png"});
        chrome.browserAction.setBadgeText({tabId: tabId, "text": "" + blockedTabs[tabId]});
    } else {
        chrome.browserAction.setIcon({tabId: tabId, path: "../img/icon_48.png"});
        chrome.browserAction.setBadgeText({tabId: tabId, "text": ""});
    }
}

function extractDomainFromURL(url) { // credit: NotScript
    if (!url) return "";
    if (url.indexOf("://") != -1) url = url.substr(url.indexOf("://") + 3);
    if (url.indexOf("/") != -1) url = url.substr(0, url.indexOf("/"));
    if (url.indexOf("@") != -1) url = url.substr(url.indexOf("@") + 1);
    if (url.match(/^(?:\[[A-Fa-f0-9:.]+\])(:[0-9]+)?$/g)) {
        if (url.indexOf("]:") != -1) return url.substr(0, url.indexOf("]:") + 1);
        return url;
    }
    if (url.indexOf(":") > 0) url = url.substr(0, url.indexOf(":"));
    return url;
}

function loadWhitelist() {
    chrome.storage.local.get('whiteListedDomains', function (object) {
        if (object.whiteListedDomains.length > 0) {
            object.whiteListedDomains.forEach(function (domain) {
                allowedDomains.push(domain);
            });
        }
    });
}

loadWhitelist();