# dynav
react based navbar dropdown menu generated from json

This repository stands as a proof of concept for the dynamic navigation bar. In this particular application navigation options are modified based on the user client agent of the browser. If the navigation bar is being viewed by a robot, crawler, or spider then links become working permalinks (which trigger a page refresh if used). If the user agent is not a bot, then navigation links are page slugs preceeded by a #. Links in this format trigger re-representation as a permalink in the url bar of the browser and trigger asynchronuos loading of the requested content.
