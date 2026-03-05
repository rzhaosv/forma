#!/usr/bin/env python3
"""
take_screenshots.py — Macra ASO Screenshot Automation

Navigates the full app flow and captures 6 App Store screenshots.

Usage:
    python3 take_screenshots.py [--skip-build]

Screenshots captured:
    1_welcome.png          — Welcome / landing screen
    2_transformation.png   — Transformation Timeline (personalised plan)
    3_paywall.png          — Paywall (trial + pricing)
    4_home.png             — Home screen (calorie ring + macros)
    5_progress.png         — Progress screen (weight chart)
    6_camera.png           — Camera screen (logging methods)
"""

import subprocess, time, sys, ctypes, ctypes.util
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
DEVICE_ID     = "1B7B36AB-38F6-4EDE-B4AB-6C1882573E50"
BUNDLE_ID     = "com.raymondzhao3000.forma"
WORKSPACE     = Path(__file__).parent / "ios/Macra.xcworkspace"
OUTPUT        = Path(__file__).parent / "screenshots"
TEST_PASSWORD = "ScreenshotTest1!"

# ── Frameworks ────────────────────────────────────────────────────────────────
_ax = ctypes.CDLL("/System/Library/Frameworks/ApplicationServices.framework/ApplicationServices")
_cf = ctypes.CDLL("/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation")

# ── CoreFoundation bindings ───────────────────────────────────────────────────
kCFStringEncodingUTF8 = 0x08000100

_cf.CFStringCreateWithCString.restype  = ctypes.c_void_p
_cf.CFStringCreateWithCString.argtypes = [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_uint32]
_cf.CFStringGetCString.restype  = ctypes.c_bool
_cf.CFStringGetCString.argtypes = [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_long, ctypes.c_uint32]
_cf.CFArrayGetCount.restype  = ctypes.c_long
_cf.CFArrayGetCount.argtypes = [ctypes.c_void_p]
_cf.CFArrayGetValueAtIndex.restype  = ctypes.c_void_p
_cf.CFArrayGetValueAtIndex.argtypes = [ctypes.c_void_p, ctypes.c_long]
_cf.CFRelease.restype  = None
_cf.CFRelease.argtypes = [ctypes.c_void_p]
_cf.CFGetTypeID.restype  = ctypes.c_ulong
_cf.CFGetTypeID.argtypes = [ctypes.c_void_p]
_cf.CFStringGetTypeID.restype  = ctypes.c_ulong
_cf.CFStringGetTypeID.argtypes = []

_cf.CFNumberCreate.restype  = ctypes.c_void_p
_cf.CFNumberCreate.argtypes = [ctypes.c_void_p, ctypes.c_int, ctypes.c_void_p]
kCFNumberFloat64Type = 13

def _cfnum(value):
    v = ctypes.c_double(value)
    return _cf.CFNumberCreate(None, kCFNumberFloat64Type, ctypes.byref(v))

def _cfstr(s):
    ref = _cf.CFStringCreateWithCString(None, s.encode("utf-8"), kCFStringEncodingUTF8)
    assert ref, f"Failed to create CFString for {s!r}"
    return ref

def _pystr(cf_ref):
    if not cf_ref:
        return None
    if _cf.CFGetTypeID(ctypes.c_void_p(cf_ref)) != _cf.CFStringGetTypeID():
        return None
    buf = ctypes.create_string_buffer(1024)
    if _cf.CFStringGetCString(ctypes.c_void_p(cf_ref), buf, 1024, kCFStringEncodingUTF8):
        return buf.value.decode("utf-8", errors="ignore")
    return None

def _cfarray(arr_ref):
    if not arr_ref:
        return []
    n = _cf.CFArrayGetCount(ctypes.c_void_p(arr_ref))
    return [_cf.CFArrayGetValueAtIndex(ctypes.c_void_p(arr_ref), i) for i in range(n)]

# ── Accessibility bindings ─────────────────────────────────────────────────────
kAXErrorSuccess = 0

_ax.AXUIElementCreateApplication.restype  = ctypes.c_void_p
_ax.AXUIElementCreateApplication.argtypes = [ctypes.c_int32]
_ax.AXUIElementCopyAttributeValue.restype  = ctypes.c_int32
_ax.AXUIElementCopyAttributeValue.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.POINTER(ctypes.c_void_p)]
_ax.AXUIElementSetAttributeValue.restype  = ctypes.c_int32
_ax.AXUIElementSetAttributeValue.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p]
_ax.AXUIElementPerformAction.restype  = ctypes.c_int32
_ax.AXUIElementPerformAction.argtypes = [ctypes.c_void_p, ctypes.c_void_p]
_ax.AXIsProcessTrusted.restype  = ctypes.c_bool

def _ax_get(element, attr):
    cf_attr = _cfstr(attr)
    value = ctypes.c_void_p()
    err = _ax.AXUIElementCopyAttributeValue(
        ctypes.c_void_p(element), ctypes.c_void_p(cf_attr), ctypes.byref(value)
    )
    _cf.CFRelease(ctypes.c_void_p(cf_attr))
    return value.value if err == kAXErrorSuccess and value.value else None

def _ax_set(element, attr, cf_value):
    cf_attr = _cfstr(attr)
    err = _ax.AXUIElementSetAttributeValue(
        ctypes.c_void_p(element), ctypes.c_void_p(cf_attr), ctypes.c_void_p(cf_value)
    )
    _cf.CFRelease(ctypes.c_void_p(cf_attr))
    return err == kAXErrorSuccess

def _ax_press(element):
    cf_action = _cfstr("AXPress")
    err = _ax.AXUIElementPerformAction(ctypes.c_void_p(element), ctypes.c_void_p(cf_action))
    _cf.CFRelease(ctypes.c_void_p(cf_action))
    return err == kAXErrorSuccess

def _ax_scroll_to_visible(element):
    """Scroll element into view using AXScrollToVisible action."""
    cf_action = _cfstr("AXScrollToVisible")
    err = _ax.AXUIElementPerformAction(ctypes.c_void_p(element), ctypes.c_void_p(cf_action))
    _cf.CFRelease(ctypes.c_void_p(cf_action))
    return err == kAXErrorSuccess

def sim_swipe_up(times=3):
    """Drag from lower to upper in the Simulator window to scroll content down."""
    # Get Simulator window bounds, then drag from 70% to 20% height
    script = """
    tell application "Simulator" to activate
    delay 0.2
    tell application "System Events"
        tell process "Simulator"
            set w to front window
            set {wx, wy} to position of w
            set {ww, wh} to size of w
            set cx to (wx + (ww / 2)) as integer
            set sy to (wy + (wh * 0.68)) as integer
            set ey to (wy + (wh * 0.22)) as integer
        end tell
        drag from {cx, sy} to {cx, ey} duration 0.35
    end tell
    """
    for _ in range(times):
        subprocess.run(["osascript", "-e", script], capture_output=True)
        time.sleep(0.5)

def _scroll_to_label(label, timeout=8.0):
    """Scroll down incrementally until a labeled element appears in the AX tree."""
    root = _sim_root()
    if not root:
        return False
    deadline = time.time() + timeout
    while time.time() < deadline:
        els = _find_elements(root, label=label)
        if els:
            _ax_scroll_to_visible(els[0])
            return True
        # Nudge scroll bars down a little
        areas = _find_elements(root, role="AXScrollArea", max_depth=10)
        for area in areas:
            vsb = _ax_get(area, "AXVerticalScrollBar")
            if vsb:
                cur_ref = _ax_get(vsb, "AXValue")
                cur = 0.0
                if cur_ref:
                    buf = ctypes.create_string_buffer(64)
                    if _cf.CFStringGetCString(ctypes.c_void_p(cur_ref), buf, 64, kCFStringEncodingUTF8):
                        try: cur = float(buf.value.decode())
                        except: pass
                new_val = min(1.0, cur + 0.15)
                cf_val = _cfnum(new_val)
                _ax_set(vsb, "AXValue", cf_val)
                _cf.CFRelease(ctypes.c_void_p(cf_val))
        time.sleep(0.3)
    return False

def scroll_to_bottom():
    """Scroll all visible AXScrollArea elements to the bottom by setting scroll bar to 1.0."""
    root = _sim_root()
    if not root:
        return
    areas = _find_elements(root, role="AXScrollArea", max_depth=10)
    for area in areas:
        vsb = _ax_get(area, "AXVerticalScrollBar")
        if vsb:
            cf_val = _cfnum(1.0)
            _ax_set(vsb, "AXValue", cf_val)
            _cf.CFRelease(ctypes.c_void_p(cf_val))
    time.sleep(0.4)

def _ax_children(element):
    ref = _ax_get(element, "AXChildren")
    return _cfarray(ref) if ref else []

def _ax_label(element):
    for attr in ("AXTitle", "AXValue", "AXDescription", "AXLabel"):
        ref = _ax_get(element, attr)
        if ref:
            s = _pystr(ref)
            if s:
                return s
    return None

def _ax_role(element):
    ref = _ax_get(element, "AXRole")
    return _pystr(ref) if ref else None

# ── AX tree search ─────────────────────────────────────────────────────────────
def _find_elements(root, role=None, label=None, max_depth=20):
    """BFS over AX tree. Returns all matching elements."""
    results = []
    queue = [(root, 0)]
    seen = set()
    while queue:
        el, depth = queue.pop(0)
        if el in seen or depth > max_depth:
            continue
        seen.add(el)
        el_role  = _ax_role(el)
        el_label = _ax_label(el)
        role_ok  = (role  is None) or (el_role  == role)
        label_ok = (label is None) or (el_label and label.lower() in el_label.lower())
        if role_ok and label_ok:
            results.append(el)
        for child in _ax_children(el):
            queue.append((child, depth + 1))
    return results

# ── Simulator helpers ──────────────────────────────────────────────────────────
def _sim_pid():
    result = subprocess.run(
        ["pgrep", "-f", "Simulator.app/Contents/MacOS/Simulator"],
        capture_output=True, text=True
    )
    pids = result.stdout.strip().split()
    return int(pids[0]) if pids else None

def _sim_root():
    pid = _sim_pid()
    if not pid:
        return None
    return _ax.AXUIElementCreateApplication(pid)

def screenshot(name):
    OUTPUT.mkdir(exist_ok=True)
    path = OUTPUT / f"{name}.png"
    subprocess.run(
        ["xcrun", "simctl", "io", DEVICE_ID, "screenshot", str(path)],
        capture_output=True
    )
    print(f"  captured  {path.name}")
    return path

def _read_bytes(path):
    try:
        return path.read_bytes()
    except FileNotFoundError:
        return None

def wait_for_change(ref_path, timeout=10.0, poll=0.4):
    """Block until the screen changes from what ref_path shows."""
    ref = _read_bytes(ref_path)
    deadline = time.time() + timeout
    tmp = OUTPUT / "_wait_tmp.png"
    while time.time() < deadline:
        time.sleep(poll)
        subprocess.run(["xcrun", "simctl", "io", DEVICE_ID, "screenshot", str(tmp)], capture_output=True)
        if _read_bytes(tmp) != ref:
            return True
    return False

# ── High-level actions ─────────────────────────────────────────────────────────
def press(label, timeout=8.0):
    """Find, scroll into view, and press first AX element whose label contains `label`."""
    root = _sim_root()
    if not root:
        print(f"  [!] Simulator not running")
        return False
    deadline = time.time() + timeout
    while time.time() < deadline:
        els = _find_elements(root, label=label)
        if els:
            _ax_scroll_to_visible(els[0])
            time.sleep(0.1)
            _ax_press(els[0])
            print(f"  press  {label!r}")
            return True
        time.sleep(0.4)
    print(f"  [miss] {label!r} not found after {timeout:.0f}s")
    return False

def press_cta(timeout=8.0):
    """Press the primary CTA button — tries all known variants."""
    for label in ("Continue", "Build My Plan", "Start My Free Trial", "Start Tracking", "Your Blueprint is Ready"):
        root = _sim_root()
        if not root:
            return False
        els = _find_elements(root, label=label)
        if els:
            _ax_press(els[0])
            print(f"  press_cta  {label!r}")
            return True
    # If none found, retry with first "Continue" variant with timeout
    return press("Continue", timeout=timeout)

def type_field(placeholder_or_label, text, timeout=8.0):
    """
    Set the value of a text field identified by placeholder or label text.
    First focuses (presses) the field, then sets AXValue.
    """
    root = _sim_root()
    if not root:
        return False
    deadline = time.time() + timeout
    while time.time() < deadline:
        for role in ("AXTextField", "AXSecureTextField", "AXTextArea"):
            for el in _find_elements(root, role=role):
                lbl = _ax_label(el)
                if lbl and placeholder_or_label.lower() in lbl.lower():
                    # Focus the field first
                    _ax_press(el)
                    time.sleep(0.15)
                    cf_val = _cfstr(text)
                    ok = _ax_set(el, "AXValue", cf_val)
                    _cf.CFRelease(ctypes.c_void_p(cf_val))
                    if ok:
                        print(f"  type  {placeholder_or_label!r}  =  {text!r}")
                        return True
        time.sleep(0.4)
    print(f"  [miss] field {placeholder_or_label!r} not found")
    return False

def launch_app():
    subprocess.run(["xcrun", "simctl", "terminate", DEVICE_ID, BUNDLE_ID], capture_output=True)
    time.sleep(0.8)
    subprocess.run(["xcrun", "simctl", "launch",    DEVICE_ID, BUNDLE_ID], capture_output=True)
    print("  launched app — waiting for JS bundle...")
    time.sleep(4.5)

def build_and_install():
    print("\n── Build ─────────────────────────────────────────────────────────")
    result = subprocess.run([
        "xcodebuild",
        "-workspace", str(WORKSPACE),
        "-configuration", "Debug",
        "-scheme", "Macra",
        "-destination", f"id={DEVICE_ID}",
        "-allowProvisioningUpdates",
        "SWIFT_COMPILATION_MODE=incremental",
    ], capture_output=True, text=True)

    if result.returncode != 0:
        print("Build FAILED. Errors:")
        for line in result.stderr.splitlines():
            if "error:" in line.lower() and "warning:" not in line.lower():
                print(" ", line)
        sys.exit(1)

    derived = Path.home() / "Library/Developer/Xcode/DerivedData"
    apps = list(derived.glob("Macra-*/Build/Products/Debug-iphonesimulator/Macra.app"))
    if not apps:
        print("Could not find built .app"); sys.exit(1)
    app_path = sorted(apps, key=lambda p: p.stat().st_mtime, reverse=True)[0]
    subprocess.run(["xcrun", "simctl", "install", DEVICE_ID, str(app_path)], check=True)
    print(f"  installed  {app_path.name}")

# ── Screenshot flow ────────────────────────────────────────────────────────────
def run():
    OUTPUT.mkdir(exist_ok=True)
    if not _ax.AXIsProcessTrusted():
        print("ERROR: Accessibility not trusted.")
        print("  System Settings → Privacy & Security → Accessibility → enable Terminal / iTerm")
        sys.exit(1)

    # Boot simulator
    print("\n── Boot simulator ────────────────────────────────────────────────")
    subprocess.run(["xcrun", "simctl", "boot",  DEVICE_ID], capture_output=True)
    subprocess.run(["open", "-a", "Simulator"],              capture_output=True)
    time.sleep(3)

    if "--skip-build" not in sys.argv:
        build_and_install()

    # Launch fresh
    print("\n── Launch ────────────────────────────────────────────────────────")
    launch_app()

    # Dismiss notification permission dialog if it appears
    press("Don't Allow", timeout=3)
    time.sleep(0.5)

    # ── Screenshot 1: Welcome ──────────────────────────────────────────────
    print("\n── [1/6] Welcome ─────────────────────────────────────────────────")
    screenshot("1_welcome")

    # ── Enter onboarding ──────────────────────────────────────────────────
    print("\n── Onboarding ────────────────────────────────────────────────────")
    press("Get Started")
    time.sleep(1.5)

    # QuickGoal — must select before Continue is enabled
    press("Lean Physique", timeout=8)
    time.sleep(0.5)
    press("Continue")
    time.sleep(1.5)

    # Height / CurrentWeight / GoalWeight / Age — pickers have defaults
    for name in ("Height", "Current Weight", "Goal Weight", "Age"):
        print(f"  → {name}")
        press("Continue", timeout=8)
        time.sleep(1.5)

    # SocialProof1
    press("Continue", timeout=8)
    time.sleep(1.5)

    # ActivityLevel
    press("Desk-bound", timeout=8)
    time.sleep(0.5)
    press("Continue")
    time.sleep(1.5)

    # TimeAvailable
    press("15 minutes", timeout=8)
    time.sleep(0.5)
    press("Continue")
    time.sleep(1.5)

    # DietaryPrefs
    press("No restrictions", timeout=8)
    time.sleep(0.5)
    press("Continue")
    time.sleep(1.5)

    # Obstacles
    press("Not enough time", timeout=8)
    time.sleep(0.5)
    press("Continue")
    time.sleep(1.5)

    # SocialProof2
    press("Continue", timeout=8)
    time.sleep(1.5)

    # CoachingStyle — CTA is "Build My Plan", not "Continue"
    press("Guided", timeout=8)
    time.sleep(0.5)
    press("Build My Plan", timeout=8)
    time.sleep(1.5)

    # LaborIllusion — auto-navigates after ~4s animation, no button
    print("  → LaborIllusion (auto-advances, waiting 6s)...")
    time.sleep(6.0)

    # ── Screenshot 2: Transformation Timeline ─────────────────────────────
    print("\n── [2/6] Transformation Timeline ─────────────────────────────────")
    screenshot("2_transformation")
    time.sleep(0.5)

    # Navigate to SignUp (unauthenticated path)
    press("Start My Free Trial", timeout=8)
    time.sleep(1.5)

    # Sign up with a fresh timestamp email to avoid "email already in use"
    print("\n── Auth: Sign Up ─────────────────────────────────────────────────")
    import time as _t
    _test_email = f"screenshot+{int(_t.time())}@macra-test.app"
    _root = _sim_root()
    if _root:
        # Email field (AXTextField)
        _email_els = _find_elements(_root, role="AXTextField")
        if _email_els:
            _ax_scroll_to_visible(_email_els[0])
            time.sleep(0.1)
            _ax_press(_email_els[0])
            time.sleep(0.15)
            _cv = _cfstr(_test_email)
            _ax_set(_email_els[0], "AXValue", _cv)
            _cf.CFRelease(ctypes.c_void_p(_cv))
            print(f"  typed email  {_test_email!r}")
        # Password + Confirm Password (AXSecureTextField x2)
        _pw_els = _find_elements(_root, role="AXSecureTextField")
        for _pw_el in _pw_els[:2]:
            _ax_scroll_to_visible(_pw_el)
            time.sleep(0.1)
            _ax_press(_pw_el)
            time.sleep(0.15)
            _cv = _cfstr(TEST_PASSWORD)
            _ax_set(_pw_el, "AXValue", _cv)
            _cf.CFRelease(ctypes.c_void_p(_cv))
        print(f"  typed password x2")
    time.sleep(0.3)
    press("Create Account", timeout=8)
    print("  → Waiting for auth + Paywall...")
    time.sleep(6)

    # ── Screenshot 3: Paywall ──────────────────────────────────────────────
    print("\n── [3/6] Paywall ─────────────────────────────────────────────────")
    screenshot("3_paywall")

    # Dismiss paywall — "Maybe later" is at the very bottom, scroll there first
    scroll_to_bottom()
    press("Maybe later", timeout=8)
    time.sleep(2.5)

    # ── Screenshot 4: Home ─────────────────────────────────────────────────
    print("\n── [4/6] Home ────────────────────────────────────────────────────")
    screenshot("4_home")

    # ── Screenshot 5: Voice Log ────────────────────────────────────────────
    print("\n── [5/6] Voice Log ───────────────────────────────────────────────")
    press("Voice", timeout=8)
    time.sleep(2.5)
    screenshot("5_voicelog")

    # ── Screenshot 6: Camera ───────────────────────────────────────────────
    print("\n── [6/6] Camera ──────────────────────────────────────────────────")
    press("Back", timeout=4)
    time.sleep(1.0)
    press("Photo", timeout=8)
    time.sleep(2.5)
    screenshot("6_camera")

    # Done — clean up temp files
    (OUTPUT / "_wait_tmp.png").unlink(missing_ok=True)
    files = list(OUTPUT.glob("[0-9]*.png"))
    print(f"\n  Done — {len(files)} screenshots in {OUTPUT}/")
    for f in sorted(files):
        print(f"    {f.name}")

def run_aso():
    """Take ASO screenshots: demo data, home, voice, food results, progress, apple health, paywall."""
    OUTPUT.mkdir(exist_ok=True)
    if not _ax.AXIsProcessTrusted():
        print("ERROR: Accessibility not trusted."); sys.exit(1)

    if "--skip-paywall" not in sys.argv:
        print("\n── Boot & Launch ─────────────────────────────────────────────────")
        subprocess.run(["xcrun", "simctl", "boot",  DEVICE_ID], capture_output=True)
        subprocess.run(["open", "-a", "Simulator"],              capture_output=True)
        time.sleep(3)

        if "--skip-build" not in sys.argv:
            build_and_install()

        launch_app()
        press("Don't Allow", timeout=3)
        time.sleep(0.5)

        # ── Paywall ────────────────────────────────────────────────────────
        print("\n── Paywall ───────────────────────────────────────────────────────")
        screenshot("aso_paywall")
        sim_swipe_up(times=4)
        press("Maybe later", timeout=10)
        time.sleep(2.5)
    else:
        print("\n── Skipping launch/paywall (already in main app) ─────────────────")

    # ── Generate demo data via Settings ───────────────────────────────
    print("\n── Generating demo data ──────────────────────────────────────────")
    press("Settings", timeout=8)
    time.sleep(1.5)
    sim_swipe_up(times=5)
    press("Generate Demo Data", timeout=8)
    time.sleep(1.0)
    press("OK", timeout=6)   # Dismiss "Demo Data Generated" alert
    time.sleep(1.0)
    press("← Back", timeout=6)
    time.sleep(2.0)          # Wait for home to re-render with data

    # ── [1] Home with demo data ────────────────────────────────────────
    print("\n── [1] Home ──────────────────────────────────────────────────────")
    screenshot("aso_1_home")

    # ── [2] Voice Log ─────────────────────────────────────────────────
    print("\n── [2] Voice Log ─────────────────────────────────────────────────")
    press("Voice", timeout=8)
    time.sleep(2.0)
    screenshot("aso_2_voice")
    press("Close", timeout=6)
    time.sleep(1.5)

    # ── [3] Camera ────────────────────────────────────────────────────
    print("\n── [3] Camera ────────────────────────────────────────────────────")
    press("Photo", timeout=8)
    time.sleep(1.5)
    press("Allow", timeout=3)
    time.sleep(2.5)
    screenshot("aso_3_camera")
    press("← Back", timeout=6)
    time.sleep(1.5)

    # ── [4] Food Results (chicken & rice) via Settings debug ──────────
    print("\n── [4] Food Results ──────────────────────────────────────────────")
    press("Settings", timeout=8)
    time.sleep(1.5)
    sim_swipe_up(times=5)
    press("Demo Food Results", timeout=8)
    time.sleep(2.0)
    screenshot("aso_4_food_results")
    press("← Back", timeout=6)
    time.sleep(1.0)
    press("← Back", timeout=6)   # Back to Home from Settings
    time.sleep(1.5)

    # ── [5] Progress ──────────────────────────────────────────────────
    print("\n── [5] Progress ──────────────────────────────────────────────────")
    press("Progress", timeout=8)
    time.sleep(2.0)
    screenshot("aso_5_progress")
    press("← Back", timeout=6)
    time.sleep(1.5)

    # ── [6] Apple Health (Settings → Fitness Integrations) ────────────
    print("\n── [6] Apple Health ──────────────────────────────────────────────")
    press("Settings", timeout=8)
    time.sleep(1.5)
    # Scroll until Apple Health Sync row is visible
    sim_swipe_up(times=2)
    time.sleep(0.5)
    screenshot("aso_6_apple_health")
    press("← Back", timeout=6)
    time.sleep(1.0)

    # ── [7] Paywall ───────────────────────────────────────────────────
    print("\n── [7] Paywall ───────────────────────────────────────────────────")
    screenshot("aso_paywall")   # already taken — just reference copy
    # (The paywall was captured at launch; re-use that file)

    files = sorted(f for f in OUTPUT.glob("aso_*.png"))
    print(f"\n  Done — {len(files)} ASO screenshots in {OUTPUT}/")
    for f in files:
        print(f"    {f.name}")


if __name__ == "__main__":
    if "--aso" in sys.argv:
        run_aso()
    else:
        run()
