# redc

*redc* is a command-line interface to reddit.

For now, it supports backing up wiki page revisions and user comments and submissions. [Pushshift](https://pushshift.io/api-parameters/) is currently supported for user comments.

## Getting Started

* Install [Deno](https://deno.land/) (`curl -fsSL https://deno.land/x/install/install.sh | sh`)
* Clone this repository
* Install *redc* using `deno install -fA src/redc.ts`. Do this every time you update the repository so that the latest changes are compiled.
* See `redc --help` for more information.