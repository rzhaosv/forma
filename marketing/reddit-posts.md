# Reddit drafts (rewritten Sep 6 2026)

**Read this first.** Reddit's Responsible Builder Policy (updated ~June 2026) says two
things that decide how these get posted:

1. "Approval is required: You must request access and get explicit approval before
   accessing any Reddit data through our API." Self-service API registration is closed,
   so there is no legitimate script-app route for this.
2. "Apps must not engage in spamming activity through automated posts, comments, or
   direct messages. This includes posting identical or substantially similar content
   across subreddits."

So: post these by hand, from the account, as a person. And they are deliberately two
different posts, not one body with a swapped first line. Same facts, different piece.

Accurate as of 6 Sep 2026: 13 apps exist, 1 is live on the App Store (Nibble), 13
submissions sit in Apple's queue (12 first releases plus a Nibble update). Do not
inflate these. If the numbers have moved, fix them before posting.

---

## Post 1 — r/SideProject

**Title:** I built 13 iOS apps in a week and only one is live. Here is the honest scoreboard.

Body:

One is on the App Store. Twelve are sitting in Apple's review queue, one of them for the
third time. That is the real state of it, and I would rather post that than the version
where everything shipped.

What I was actually testing: how much of a one-person app studio can be automated end to
end. Bundle ID, provisioning profile, App Store Connect record, subscriptions,
screenshots, privacy answers, submission. All of it is scripted now. The part that still
needs a human is the part Apple wants a human for, which is fair.

Three things that cost me real days:

- I ran out of cloud build minutes on day one, so builds moved to a free GitHub macOS
  runner doing the archive locally. Mid-week Apple started refusing uploads from the
  older Xcode, so the runner had to move up a version, which then would not compile a
  C++ dependency that React Native pins. A small config plugin patches it at install.
- The calorie tracker got rejected twice. Once for a missing Terms of Use link. Once
  because the paywall showed the monthly price larger than the amount actually charged,
  and a health screen made claims with no citations. Both were my fault and both were
  right calls.
- A deploy silently failed for hours because the host caps free projects at 12
  serverless functions and I had added a 13th. Nothing errored in a way I would see. The
  site just quietly stopped updating.

Everything is local-first: no accounts, data stays on the phone, subscriptions through
RevenueCat with 7-day trials.

The site is at https://tryforma.app and the homepage has the ship log, including the
rejections.

What I actually want to know: does a studio page with one live app and twelve pending
read as momentum, or as vapour? I genuinely cannot tell from the inside.

---

## Post 2 — r/indiehackers

**Title:** Shipping iOS apps on $0 of build infrastructure: what broke, and the fix for each

Body:

I spent a week seeing how far a solo iOS pipeline gets on free tiers only. Sharing the
breakages because each one cost me hours and none of them were googleable in the moment.

**Cloud build minutes ran out immediately.** Moved to a GitHub Actions macOS runner
running the build locally instead of on the paid service. Free tier covers it. The
signing credentials go in as repo secrets: the distribution certificate as a base64 p12,
plus a per-app provisioning profile.

**Apple started rejecting uploads from the older Xcode mid-week.** Bumping the runner
image fixed the upload and broke the build: a C++ dependency that React Native pins does
not compile on the newer toolchain. Fixed with a config plugin that patches the
dependency at install time. Worth knowing: I burned three 20-minute CI runs on plugin
versions that did not work, because I was testing the patch by running CI. Test the
generated snippet locally first.

**Two App Store rejections, both legitimate.** A missing Terms of Use link in the
description. And a paywall where the per-month figure was visually larger than the amount
actually billed, which Apple treats as misleading. If your annual plan shows "$2.50/mo"
bigger than "$29.99/year", expect that one.

**A silent deploy failure.** The host caps free projects at 12 serverless functions. I
added a 13th and deploys started failing at the very last step, so the site kept serving
the old build with no visible error. Folded three related endpoints into one dispatcher
behind URL rewrites so the public paths did not change.

Current honest state: 13 apps built, 1 live, 12 in review. Ask me anything about the
pipeline, I will answer specifically.

---

## Posting notes

- Post them on different days, not the same hour.
- Reply to comments yourself. A post that gets replies and then goes quiet does worse
  than no post.
- r/SideProject wants the product and the honest doubt. r/indiehackers wants the
  mechanics. Do not merge them back together.
- Neither post should be crossposted to the other sub.
