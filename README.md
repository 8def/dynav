# dynav
react based navbar dropdown menu generated from json

This repository stands as a proof of concept for the dynamic navigation bar. In this particular application navigation options are modified based on the user agent of the browser. If the navigation bar is being viewed by a robot, crawler, or spider then links become working permalinks (which trigger a page refresh if used). If the user agent is not a bot, then navigation links are page slugs preceeded by a #. Links in this format trigger re-representation as a permalink in the url bar of the browser and trigger asynchronuos loading of the requested content. In handling page loading this way data requests are limited to only what is essential, but browser navigation buttons like back and forward remain fully functional.

For the purpses of demonstration I've included content.js, which simply displays the slug of the currently selected page.
I've also included a .htaccess file which redirects generated permalinks to the index.html file.
