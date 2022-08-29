/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {fs_file_exists, fs_read_utf8, fs_write_utf8, AccessToken, http_get, http_post} from './io.ts';
import { delay } from 'https://deno.land/std/async/delay.ts'

const credFile = '.redc/cred.rc';
const authFile = '.redc/auth';
const wikiPath = '.redc/wiki';
const userPath = '.redc/user';

export async function http_auth() {
    const map: Map<string, string> = new Map();
    fs_read_utf8(credFile).split('\n').forEach(x => { const ys = x.split('='); map.set(ys[0], ys[1]); });

    const clientID = map.get('clientID');
    const clientSecret = map.get('clientSecret');
    const user = map.get('user');
    const password = map.get('password');

    const url = 'https://www.reddit.com/api/v1/access_token';
    const body = `grant_type=password&username=${user}&password=${password}`;
    const auth = `Basic ${btoa(`${clientID}:${clientSecret}`)}`
    const contentType = 'application/x-www-form-urlencoded';
    const v: AccessToken = await http_post(url, auth, contentType, body);
    console.log(v);
    return `${v.token_type} ${v.access_token}`;
}

async function get_auth() {
    let now = Date.now();
    let auth;
    if (fs_file_exists(authFile)) {
        let xs: string[] = fs_read_utf8(authFile).split('=');
        const a = Number(xs[0]);
        if (now >=  a + 3000_000) {
            // expired/ will expire in 10 min
            auth = await http_auth();
        }
        else {
            now = a;
            auth = xs[1];
        }
    }
    else {
        auth = await http_auth();
    }
    fs_write_utf8(authFile, `${now}=${auth}`);
    return auth;
}

export async function backup_user(user: string) {
    const auth = await get_auth();

    // comments
    const comments = await list(`https://oauth.reddit.com/user/${user}/comments`, auth);
    fs_write_utf8(`${userPath}/${user}/comments/meta.json`, JSON.stringify(comments));

    // submitted
    const submitted = await list(`https://oauth.reddit.com/user/${user}/submitted`, auth);
    fs_write_utf8(`${userPath}/${user}/submitted/meta.json`, JSON.stringify(submitted));
}

export async function backup_wiki(sub: string, page: string) {
    const auth = await get_auth();
    const b = await list(`https://oauth.reddit.com${sub}/wiki/revisions${page}`, auth);
    b.forEach(x => x.author = x.author.data.name);
    fs_write_utf8(`${wikiPath}${page}/meta.json`, JSON.stringify(b));

    for (const x of b) {
        await backup_wiki_page_rev(sub, page, x.id, auth);
    }
}

async function backup_wiki_page_rev(sub: string, page: string, id: string, auth: string) {
    const fp = `${wikiPath}${page}/${id}.json`;
    const up = `https://oauth.reddit.com${sub}/wiki${page}?v=${id}`;
    if (!fs_file_exists(fp)) {
        await delay(1500);
        console.log(`downloading: ${fp}`);
        const y = await http_get(up, auth);
        const x = y.data;
        x.revision_by = x.revision_by.data.name;
        fs_write_utf8(fp, JSON.stringify(x));
    }
}

async function list(url: string, auth: string) {
    const u = `${url}?raw_json=1&limit=100&count=`;
    const xs = []

    let after = undefined;
    let n = 0;
    while (true) {
        await delay(1500);
        const uu: string = after ? `${u}${n}&after=${after}` : `${u}${n}`
        const x = await http_get(uu, auth);
        console.log(`kind: ${x.kind}, count: ${n}, length: ${x.data.children.length}, before: ${x.data.before}, after: ${x.data.after}`);
        n += x.data.children.length;
        after = x.data.after;
        xs.push(...x.data.children);
        if (!x.data.after) break;
    }
    return xs;
}

export async function backup_ps_user(user: string) {
    const url = `https://api.pushshift.io/reddit/comment/search/?author=${user}&sort=asc&size=100&sort_type=created_utc&after=`;

    const ys = [];
    let after = 0;
    while (true) {
        await delay(1500);
        const u = `${url}${after}`
        let mm: Response;
        try {
            mm = await fetch(u);
            if (!mm.ok) {
                console.log(mm.statusText);
                continue;
            }
            const xs: any[] = (await mm.json()).data;
            if (!xs.length) break;
            const a = xs[0];
            const b = xs[xs.length-1];
            console.log(`count: ${xs.length}, from: ${a.created_utc}, to: ${b.created_utc}`);
            after = b.created_utc;
            ys.push(...xs);
        }
        catch (e) {
            console.log(e);
        }
    }
    fs_write_utf8(`${userPath}/${user}/ps_comments/meta.json`, JSON.stringify(ys));
}