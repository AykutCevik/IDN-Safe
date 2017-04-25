function setChildTextNode(elementId, text) {
    document.getElementById(elementId).innerText = text;
}

function init() {
    document.title = chrome.i18n.getMessage("extensionName") + ' - ' + chrome.i18n.getMessage("textSettingsTitle");
    setChildTextNode('textSettingsTitle', chrome.i18n.getMessage("textSettingsTitle"));
    setChildTextNode('textTitleWhitelist', chrome.i18n.getMessage("textSettingsWhiteListTitle"));
    setChildTextNode('textWhitelistList', chrome.i18n.getMessage("textSettingsWhiteListDescription"));
    setChildTextNode('buttonRemoveFromWhitelist', chrome.i18n.getMessage("buttonRemoveFromWhitelist"));
    setChildTextNode('buttonRevokeAllTemp', chrome.i18n.getMessage("buttonRevokeAllTemporary"));
    setChildTextNode('textVersionInfo', chrome.i18n.getMessage("extensionName") + ' ' + (chrome.app !== undefined ? chrome.app.getDetails().version : ''));

    document.getElementById('buttonRemoveFromWhitelist').onclick = removeFromWhitelist;
    document.getElementById('buttonRevokeAllTemp').onclick = revokeAllTemporarilyAllowed;
    loadDomainList();
}

function revokeAllTemporarilyAllowed() {
    chrome.runtime.sendMessage({type: REQ_REVOKE_FROM_TEMP_LIST}, function (response) {
        var data = {message: chrome.i18n.getMessage("textRevokedFromTemp")};
        document.getElementById('options-snackbar').MaterialSnackbar.showSnackbar(data);
    });
}

function removeFromWhitelist() {
    var domains = getSelectedDomains();
    if (domains.length > 0) {
        chrome.runtime.sendMessage({type: REQ_REMOVE_FROM_WHITELIST, list: domains});
    }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.type) {
        case REQ_URLS_DEWHITELISTED:
            var data = {message: chrome.i18n.getMessage("textRemovedFromWhitelist")};
            document.getElementById('options-snackbar').MaterialSnackbar.showSnackbar(data);
            loadDomainList();
            break;
    }
});

function getSelectedDomains() {
    var checkedBoxes = document.querySelectorAll('input[data-domain]:checked');

    var domains = [];
    checkedBoxes.forEach(function (elm) {
        var domain = elm.getAttribute('data-domain');
        domains.push(domain);
    });
    return domains;
}

function loadDomainList() {
    chrome.storage.local.get('whiteListedDomains', function (object) {
        var domains = object.whiteListedDomains;
        displayWhitelistedDomains(domains);
    });
}

function displayWhitelistedDomains(domains) {

    document.getElementById('whitelist_list').innerHTML = '';
    document.getElementById('no_whitelisted_domains').innerText = '';

    if (!domains || domains.length === 0) {
        setChildTextNode('no_whitelisted_domains', chrome.i18n.getMessage("textNoWhitelistedDomains"));
    } else {
        var container = document.getElementById('whitelist_list');
        var htmlTmpl = document.getElementById('template_list_item').innerHTML;
        domains.forEach(function (domain) {
            var punycodeDomain = punycode.toUnicode(domain);
            var itemHtml = htmlTmpl.replace(/__DOMAIN_TEXT__/g, punycodeDomain);
            var itemHtml = itemHtml.replace(/__DOMAIN__/g, domain);
            var itemHtml = itemHtml.replace(/__LIST_ID__/g, hash(domain));
            container.innerHTML += itemHtml;
        });
    }
}

function hash(str) { // fast workaround
    var hash = 0;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

document.addEventListener('DOMContentLoaded', init);