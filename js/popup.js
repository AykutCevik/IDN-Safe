function setChildTextNode(elementId, text) {
    document.getElementById(elementId).innerText = text;
}

function getSelectedDomains() {
    var checkedBoxes = document.querySelectorAll('input[data-domain]:checked');

    var domains = [];
    checkedBoxes.forEach(function (elm) {
        var domain = elm.getAttribute('data-domain');
        domains.push(domain);
    });
    return domains;
}

function reloadCurrentTab() {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabArray) {
        var tabId = tabArray.length > 0 ? tabArray[0].id : -1;
        if (tabId !== -1) {
            chrome.tabs.reload(tabId);
        }
    });
    window.close();
}

function allowSelectedTemporarily() {
    var domains = getSelectedDomains();
    chrome.extension.sendRequest({type: REQ_ALLOW_TEMPORARILY, list: domains}, function (response) {
        reloadCurrentTab();
    });
}

function allowSelectedAlways() {
    var domains = getSelectedDomains();
    chrome.extension.sendRequest({type: REQ_ALLOW_ALWAYS, list: domains}, function (response) {
        reloadCurrentTab();
    });
}

function initUI() {
    setChildTextNode('popupTitle', chrome.i18n.getMessage("extensionName"));
    setChildTextNode('popup_desc', chrome.i18n.getMessage("textPopupDescription"));
    setChildTextNode('btn_allow_temp', chrome.i18n.getMessage("buttonAllowTemp"));
    setChildTextNode('btn_allow_always', chrome.i18n.getMessage("buttonAllowAlways"));

    document.getElementById('btn_allow_temp').onclick = allowSelectedTemporarily;
    document.getElementById('btn_allow_always').onclick = allowSelectedAlways;
}

function displayBlockedDomains(urls) {
    if (!urls || urls.length === 0) {

        var htmlTmpl = document.getElementById('template_no_items').innerHTML;
        htmlTmpl = htmlTmpl.replace('__MSG__', chrome.i18n.getMessage("textNoBlockedDomains"));
        document.getElementById('block_list_container').innerHTML = htmlTmpl;
        document.getElementById('btn_allow_temp').className += ' mdl-button--disabled';
        document.getElementById('btn_allow_always').className += ' mdl-button--disabled';
    } else {
        var container = document.getElementById('blocked_list');
        var htmlTmpl = document.getElementById('template_list_item').innerHTML;
        urls.forEach(function (domain) {
            var punycodeDomain = punycode.toUnicode(domain);
            var itemHtml = htmlTmpl.replace(/__DOMAIN_TEXT__/g, punycodeDomain);
            var itemHtml = itemHtml.replace(/__DOMAIN__/g, domain);
            var itemHtml = itemHtml.replace(/__LIST_ID__/g, hash(domain));
            container.innerHTML += itemHtml;
        });
    }
}


function getBlockUrls() {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabArray) {
        var tabId = tabArray.length > 0 ? tabArray[0].id : -1;
        if (tabId !== -1) {
            chrome.extension.sendRequest({type: REQ_BLOCKED_URLS, tabId: tabId}, function (response) {
                displayBlockedDomains(response.list);
            });
        }
    });
}

function hash(str) { // fast workaround
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function init() {

    initUI();
    getBlockUrls();
}

document.addEventListener('DOMContentLoaded', init);