# IDN-Safe
"IDN Safe" is a browser extension which blocks internationalized domain names to prevent you from visiting probable fake sites

IDN Safe blocks internationalized domain names also known as punycode domains. This helps you to identify them and will prevent you from visiting probable fake sites.

The use of Unicode in domain names makes it potentially easier to spoof web sites as the visual representation of an IDN string in a web browser may make a spoof site appear indistinguishable to the legitimate site being spoofed, depending on the font used.

With IDN Safe you can temporarily allow domains or whitelist them at all. By default they are blocked.

## Get it

* [Chrome Web Store](https://chrome.google.com/webstore/detail/idn-safe/kegeenojcnijgmfgkcokknkbpmjcabdm)
* [Opera Add-ons](https://addons.opera.com/de/extensions/details/idn-safe/)
* [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/idn-safe/)

## More
* [Internationalized domain name](https://en.wikipedia.org/wiki/Internationalized_domain_name)
* [Punycode](https://en.wikipedia.org/wiki/Punycode)
* [List of internationalized domain names](https://blogs.msdn.microsoft.com/shawnste/2006/09/14/idn-test-urls/)

## Example of prevention 
Take a look at "рaypal.com" (warning). It seems like a valid paypal-Domain. In fact it's not. The first character is not an ASCII p. IDN Safe prevents you from visiting this site by blocking it.
