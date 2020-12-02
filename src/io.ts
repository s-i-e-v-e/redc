/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const userAgent = "deno:redc:0.1 (by /u/_sieve)"

export interface AccessToken {
    access_token: string,
    token_type: string,
}

export async function http_get(url: string, auth: string) {
    const response = await fetch(url, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
            'User-Agent': userAgent,
            'Authorization': auth,
        },
        referrerPolicy: 'no-referrer',
    });
    return response.json();
}

export async function http_post(url: string, auth: string, contentType: string, body: string) {
    const response = await fetch(url, {
        method: 'POST',
        cache: 'no-cache',
        headers: {
            'Authorization': auth,
            'Content-Type': contentType,
        },
        referrerPolicy: 'no-referrer',
        body: body,
    });
    return response.json();
}

interface FileName {
    dir: string,
    name: string,
    ext: string,
}

function parse_path(file: string) {
    let n = file.lastIndexOf("/");
    const dir = n === -1 ? "." : file.substring(0, n);
    file = n === -1 ? file : file.substring(n + 1);

    n = file.lastIndexOf(".");
    const name = n === -1 ? file : file.substring(0, n);
    const ext = n === -1 ? '' : file.substring(n);
    return {
        dir: dir,
        name: name,
        ext: ext,
    };
}

function mkdir(dir: string) {
    if (!exists(dir)) Deno.mkdirSync(dir, { recursive: true });
}

export function writeTextFile(p: string, data: string) {
    const fp = parse_path(p);
    mkdir(fp.dir);
    Deno.writeTextFileSync(p, data);
}

export function readTextFile(p: string) {
    const fp = parse_path(p);
    mkdir(fp.dir);
    return Deno.readTextFileSync(p);
}

export function exists(p: string) {
    try {
        Deno.statSync(p as string);
        return true;
    }
    catch (e) {
        if (e instanceof Deno.errors.NotFound) {
            return false;
        }
        else {
            throw e;
        }
    }
}