/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {backup_ps_user, backup_user, backup_wiki} from "./reader.ts";

const println = console.log;

function version() {
    println('redc 0.1');
    println('Copyright (C) 2020 Sieve (https://github.com/s-i-e-v-e)');
    println('This is free software; see the source for copying conditions.  There is NO');
    println('warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.');
}

function help() {
    version();
    println('Usage:');
    println('help,    --help,          Display this information.');
    println('version, --version        Display version information.');
    println('backup wiki /r/sub /page  Back up all revisions of /r/sub/wiki/page');
    println('backup user username      Back up all comments and submissions for username');
    println('backup ps-user username   Back up all comments for username using Pushshift');
}

async function exec_backup(type: string, args: string[]) {
    switch (type) {
        case 'wiki': {
            const sub = args[0];
            const page = args[1];
            backup_wiki(sub, page);
            break;
        }
        case 'user': {
            const user = args[0];
            backup_user(user);
            break;
        }
        case 'ps-user': {
            const user = args[0];
            backup_ps_user(user);
            break;
        }
        default: throw new Error(`Unknown backup type: ${type}`);
    }
}

export function main(args: string[]) {
    const cmd = args[0];
    switch(cmd) {
        case "backup": exec_backup(args[1], args.slice(2)); break;
        case "--version":
        case "version": version(); break;
        case "--help":
        case "help":
        default: help(); break;
    }
}

if (import.meta.main) main(Deno.args);