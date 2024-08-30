# alphaama is just a nostr fucking client

that:
- is a research in UI/UX on how a command line interface (cli) can merge with a graphical user interface (gui)
- tries to be fun and weird.
- let's you interact with nostr exposing the protocol instead of abstracting it.
- tries to be minimalistic, flexible and powerful.
- doesn't do it all yet, soon™.
- is not for everyone.
- keeps changing in breaking ways.
- has bugs and bad decisions.
- is a learning tool.
- is written in vanilla js, html and css.
- is public domain, free and open-source.
- you can do whatever the fuck you want with it.

source code:
- https://github.com/eskema/alphaama

nostr:
- https://github.com/nostr-protocol/nostr

depends on:
- https://github.com/nbd-wtf/nostr-tools

dev deployment:
- https://wip.alphaama.com

stable deployment:
- https://alphaama.com


![view of alphaama](https://i.nostr.build/XyflANm8pOEQUHI6.jpg)


- alphaama doesn't do much on it's own, it takes commands given by the user and executes them
- it has a single input field for interaction like a Command Line Interface (CLI) wrapped in a Graphical User Interface (GUI) that can be interacted with
- commands are given by prefixing the input with a value (default is ".aa")
- if no command prefix is found at the start of the input it is interpreted as a kind:1 draft (if logged in)
- displays all event kinds using a threaded generic event view
- can be used to create any event type (raw JSON) and autofills the missing required fields


— OPTIONS


- to set an option, type: `.aa o set` followed by `key` and `value`
- to reset options, type `.aa o reset` followed by a `key`, if left empty resets all to defaults

example of how to switch theme (team) from dark to light and then setting `trust` to `4` so it loads stuff from your fellas.
https://v.nostr.build/w5smDlU8vMRQ1r4N.mp4



— RELAYS

- relays are kept locally and are separate from your published relays
- relays can be added to sets
- default set for reading is "read"
- default set for writing is "write"
- default set for disabled is "off"
- relay sets (relset) can be used in requests or to create a list (kind:10002)
- other sets are also added automatically depending from where they were imported (ext, k3, k10002, hint)

to add a relay, type: `.aa r add <url> <set_1> <set_2>`
- `url` is a valid full URL
- `set` is a relay set (a-z_0-9) 
- multiple sets can be added
- example command for adding multiple relays: `.aa r add wss://relay1.com read write, wss://relay2.org read, wss://relay3.net write`


— LOGIN


- you can use alphaama without logging in because you can read from Nostr without having to sign anything
- to sign notes, you need a signer already configured with a key. (NIP7 enabled browser extension)
- make sure your signer extension is active on the current tab
- you have the option to set a mode on login, either easy or hard
- easy mode adds useful filter queries
- hard mode prevents any external connections

example for easy login type: `.aa u login easy`
https://v.nostr.build/OXw18vj2M8h1Mei0.mp4
￼

— REQUESTING EVENTS


to receive events from relays, you send them requests containing filters
- relays will start sending events one by one that match the request filters
- relays will keep relaying new events as they receive them until the request is closed.
- some requests will take some time to process due to current implementation limitations. 
- running the query `b` for example, might make your browser ui become unresponsive until it finishes processing metadata, relay list and follow list of all your follows. 
- processing a large amount of follow lists (kind:3) requires heavier processing as it builds a Web-of-Trust (WoT) score. 

the WoT score system used here is very primitive and consists of 2 integer values: 
- a value that you can set manually (default is 0, 9 for the logged-in pubkey and 5 for it's follows) and has influence in displaying content (renders image, video, etc)
- a generated value from the number of followers the pubkey has that you also follow. this is only used as a visual hint

to send a request , type: `.aa q req <relset> <JSON_filter>`
- `relset` is either a single relay URL or a relay set id
- `JSON_filter` is a single Nostr request filter in raw JSON
- you can add an extra value in the filter to close the request after all stored events have been sent: `"eose":"close"`

the following variables can be used in filters:
- "n_<int>": converts to a timestamp from `int` days ago. ex: "n_1" converts to 1 day ago
- "d_<date_string>": converts to a timestamp of `date_string`. ex: "d_2024-08-21"
- "now": converts to the timestamp of now.
- "u": converts to your pubkey (if logged in)
- "k3": converts to a list of pubkeys you follow (if logged in)

you can store requests so it's easier to run them.
to store a request, type: `.aa q add <fid> <JSON_filter>`
- `fid` is a filter identifier with the following allowed characters:  `a-z_0-9`
- `JSON_filter` is explained above

to run a query, type: `.aa q run <fid> <relset>` 
- `relset` is a single relay url or relay set; by leaving it empty, it defaults to your `read` relay set
- `fid` is explained above

to close a request, type: `.aa q close <fid>`
- if `fid` is omitted all requests will be closed instead

example of running the request `a` 
https://v.nostr.build/hzQufBzjStD8L8j6.mp4
￼

TIP => you can run multiple requests at once, separating the values with a comma (you can do this on other commands as well)
example: `.aa q run f, u, n`