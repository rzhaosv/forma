# Creating the Reddit API app (2 minutes, once)

The form must be filled in a browser Claude is **not** driving. reCAPTCHA detects the
DevTools connection that the Chrome extension uses and quietly refuses the checkbox,
which is why "I'm not a robot" does nothing and the submit comes back with the
Responsible Builder Policy banner.

## Steps

1. Open **Safari**, or a Chrome window started fresh (quit Chrome first, then reopen).
   Not the window Claude has been using.
2. Go to <https://www.reddit.com/prefs/apps>
3. Log in as **u/midnight_chatter126** if asked.
4. Click **are you a developer? create an app…** and fill in:

   | field        | value                            |
   |--------------|----------------------------------|
   | name         | `forma-poster`                   |
   | type         | **script** (the third radio)     |
   | description  | `Posts release notes for tryforma.app apps` |
   | about url    | `https://tryforma.app/`          |
   | redirect uri | `http://localhost:8765/callback` |

5. Tick **I'm not a robot**, then **create app**.

The app appears at the top of the page. You need two strings from it:

- **client id** — the short string directly under the app name, near "personal use script"
- **secret** — the longer string on the line labelled `secret`

## Then, in your own terminal

```
bash ~/workspace/forma/marketing/reddit/setup.sh
```

It prompts for your username, the client id and the secret (hidden while typing),
writes `~/.config/reddit_forma.json` with mode 600, and runs the one-time OAuth
consent. Nothing is echoed and nothing goes through the chat.

## If "create app" still refuses

Two other things gate it, in order of likelihood:

1. **Email not verified** on the account. Check
   <https://www.reddit.com/settings/account> — an unverified email blocks app
   creation. Verify, then retry.
2. **API usage not registered.** The form links to
   <https://www.reddit.com/wiki/api/#wiki_read_the_full_api_terms_and_sign_up_for_usage>.
   Low-volume script apps normally do not need this, but if step 1 is fine and it
   still fails, sign up there and retry.

## If you would rather not bother

The drafts are ready to paste by hand:

- `marketing/reddit-sideproject-post.md` — for r/SideProject and r/indiehackers

Posting them manually takes about the same time as this setup. The API only pays
off if we post repeatedly.
