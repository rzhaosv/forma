#!/usr/bin/env bash
# One-time Reddit setup. Run it in your own terminal:
#
#     bash ~/workspace/forma/marketing/reddit/setup.sh
#
# It asks for the two values from https://www.reddit.com/prefs/apps, writes them to
# ~/.config/reddit_forma.json (chmod 600), and runs the OAuth consent step. The secret
# is never echoed and never leaves this machine.
set -euo pipefail

CFG="$HOME/.config/reddit_forma.json"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo
echo "Reddit app setup"
echo "----------------"
echo "On https://www.reddit.com/prefs/apps you should have created an app with:"
echo "  name         forma-poster"
echo "  type         script          <- must be 'script', not 'web app'"
echo "  redirect uri http://localhost:8765/callback"
echo
echo "The client id is the short string directly UNDER the app name."
echo "The secret is the longer string labelled 'secret'."
echo

read -r -p "Reddit username (no u/): " USERNAME
read -r -p "client id: " CLIENT_ID
read -r -s -p "client secret (hidden): " CLIENT_SECRET
echo

if [ -z "$USERNAME" ] || [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
  echo "All three are required. Nothing written." >&2
  exit 1
fi

mkdir -p "$(dirname "$CFG")"
umask 077
python3 - "$CFG" "$USERNAME" "$CLIENT_ID" "$CLIENT_SECRET" <<'PY'
import json, sys
cfg, user, cid, secret = sys.argv[1:5]
json.dump({
    "client_id": cid.strip(),
    "client_secret": secret.strip(),
    "user_agent": f"forma-poster/0.1 by {user.strip()}",
}, open(cfg, "w"), indent=1)
PY
chmod 600 "$CFG"
echo "Wrote $CFG"
echo
echo "Now authorising. A browser tab will open: click Allow."
python3 "$DIR/reddit_post.py" auth
echo
echo "Done. Claude can post from here on."
