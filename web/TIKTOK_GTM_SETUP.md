# 🎵 TikTok & GTM Setup Guide

I've already updated your site code (live on `tryforma.app`) to "talk" to Google Tag Manager. Now you just need to add the TikTok tag inside your GTM dashboard.

## Step 1: Create a Trigger (The "When")
This tells GTM to fire whenever someone joins the waitlist.
1.  In GTM, go to **Triggers** → **New**.
2.  Name it: `Waitlist Signup`.
3.  **Trigger Type**: `Custom Event`.
4.  **Event Name**: `Email Captured` (Case sensitive).
5.  **This trigger fires on**: `All Custom Events`.
6.  Click **Save**.

## Step 2: Create the TikTok Tag (The "What")
1.  Go to **Tags** → **New**.
2.  Name it: `TikTok - Waitlist Signup`.
3.  **Tag Configuration**: Click to choose, then search for **TikTok Pixel** (in the Community Template Gallery if needed).
    - Or choose **Custom HTML** and paste your TikTok base code.
4.  **Triggering**: Select the `Waitlist Signup` trigger you just created.
5.  Click **Save**.

## Step 3: Publish
**CRITICAL**: Your changes won't go live until you click the big blue **Submit** button in the top right corner of GTM and click **Publish**.

---

## 📈 Why this is better
By using GTM, you can:
- **Track ROAS**: TikTok will know exactly which ad led to which email signup.
- **No more code changes**: If you want to add Meta (Facebook) or Twitter tracking later, you can do it all in GTM without me needing to push more code!

**Your GTM is now fully "wired up" to your site events.** Once you add these two things above, your marketing funnel will be 100% complete!
