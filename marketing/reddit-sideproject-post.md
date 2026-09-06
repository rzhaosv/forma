# r/SideProject post (draft, Sep 5 2026)

**Title:** Shipped 11 iOS apps in 5 days from a one-person studio, with a public ship log. Here is what actually went out.

Last week I had zero apps in review and a free EAS plan with no build minutes left. Today there are 11 apps on the studio page, eight of them in Apple's queue, one live, and a ship log on the homepage that updates as things go out.

What it took:

- Ran out of EAS cloud builds, so everything moved to a free GitHub macOS runner with eas build --local. Mid-week Apple started rejecting uploads from the older Xcode, so the builds moved to the newest runner, which then refused to compile a C++ dependency (fmt) that React Native 0.81 pins. A small config plugin patches it at install time.
- Apple rejected the calorie tracker twice. First for a missing Terms of Use link in the description. Then because the paywall showed the per-month price bigger than the amount actually billed, and the BMI screen had no citations. Both fixed, resubmitted.
- Every app is local-first: no accounts, data stays on the phone, RevenueCat for subscriptions with 7-day trials.

The part I am least sure about is the site itself. Besides the apps it has seventeen short paths: plain-spoken pages for one specific kind of rough patch (getting out of the house again, a fresh start a bit later, keeping your composure when a group turns on you, playing it long as a founder). Each has a comment wall that needs no account.

Site: https://tryforma.app (the ship log is on the homepage)

Straight questions: does the homepage read as a studio you would trust, or as too much? Which path would you click first?

---

# r/indiehackers variant

**Title:** Build-in-public log: 11 iOS apps shipped in 5 days, 2 Apple rejections fixed, zero cloud build minutes used

Same body, swap the opening line to: "Posting the log because the build pipeline part might save someone a week."
