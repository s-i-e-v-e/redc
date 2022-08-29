/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const userAgent = "deno:redc:0.1 (by /u/_sieve)"
export {
    fs_file_exists,
    fs_cp,
    fs_read_utf8,
    fs_write_utf8,
    fs_parse_path
} from "https://raw.githubusercontent.com/s-i-e-v-e/nonstd/3b664da5b5e8013cb36b1557d550e0a80da95636/src/ts/os/fs.ts"


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