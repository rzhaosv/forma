# Creating the Reddit API app

## What we know

Diagnosed on the live form (old.reddit.com/prefs/apps):

- reCAPTCHA loads correctly: the `grecaptcha` object is present, the widget has its
  sitekey, and the challenge iframe renders at full size. Reddit is not blocking the
  account and the page is not broken.
- The account email (midnight.chatter126@gmail.com) is on file with no "verify" prompt.
- `/settings/oauth-apps` just redirects back to this same legacy form, so there is no
  alternative UI to use.
- The Responsible Builder Policy banner next to the button is the response to a submit
  that had no solved CAPTCHA. It also clears the description field, which makes it look
  like an error. It is not one.

So the CAPTCHA itself is the only gate, and it is failing on the browser side.

## Why Private Browsing makes it worse, not better

reCAPTCHA v2 needs third-party cookies from google.com. Safari Private Browsing plus
"Prevent cross-site tracking" blocks exactly that, so the checkbox either does nothing
or the challenge never resolves. Incognito is the wrong tool here.

## Try in this order

1. **Normal Safari window** (not Private), with Safari > Settings > Privacy >
   **Prevent cross-site tracking** temporarily unticked. Turn it back on afterwards.
2. **Normal Chrome window.** Quit Chrome completely first, so the window is not the one
   Claude drives over the DevTools protocol; that connection also breaks reCAPTCHA.
3. **Your phone.** old.reddit.com/prefs/apps works in mobile Safari and usually has none
   of the desktop content blockers in the way.
4. **Turn off any ad or content blocker** for reddit.com and google.com, then retry 1.

Field values:

| field        | value                            |
|--------------|----------------------------------|
| name         | `forma-poster`                   |
| type         | **script** (the third radio)     |
| description  | `Posts release notes for tryforma.app apps` |
| about url    | `https://tryforma.app/`          |
| redirect uri | `http://localhost:8765/callback` |

Then, in your own terminal:

```
bash ~/workspace/forma/marketing/reddit/setup.sh
```

It prompts for username, client id and secret (hidden), writes
`~/.config/reddit_forma.json` at mode 600, and runs the OAuth consent step.

## Note

Claude cannot complete CAPTCHAs. That is a hard rule, not a capability gap, so this one
step will always need a human regardless of which browser works.

## The alternative, if this stays stuck

Post by hand. The draft is at `marketing/reddit-sideproject-post.md`, sized for
r/SideProject and r/indiehackers. Doing that twice costs about what this setup costs
once. The API only wins if we post on a schedule.
