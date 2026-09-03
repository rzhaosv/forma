import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Native "Enjoying Macra?" rating prompt, fired only at genuine positive
// moments (a badge earned, or after enough real usage to have an opinion).
// This is the compliant, highest-ROI way to grow ratings: Apple itself
// throttles requestReview to ~3x/year per user, and we add our own guard so we
// never nag. We request a review — we never require, reward, or gate on it
// (App Store Guideline 2.3.10). No positive-review conditioning anywhere.

const LAST_PROMPT_KEY = '@macra_review_last_prompt';
const PROMPTED_TRIGGERS_KEY = '@macra_review_triggers';
// Don't ask more than once every 45 days even if multiple wins happen.
const MIN_DAYS_BETWEEN = 45;

type Trigger = 'badge' | 'milestone';

async function alreadyPrompted(trigger: Trigger): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(PROMPTED_TRIGGERS_KEY);
    const set: string[] = raw ? JSON.parse(raw) : [];
    return set.includes(trigger);
  } catch {
    return false;
  }
}

async function recentlyPrompted(): Promise<boolean> {
  try {
    const last = await AsyncStorage.getItem(LAST_PROMPT_KEY);
    if (!last) return false;
    const days = (Date.now() - Number(last)) / 86_400_000;
    return days < MIN_DAYS_BETWEEN;
  } catch {
    return false;
  }
}

async function markPrompted(trigger: Trigger): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_PROMPT_KEY, String(Date.now()));
    const raw = await AsyncStorage.getItem(PROMPTED_TRIGGERS_KEY);
    const set: string[] = raw ? JSON.parse(raw) : [];
    if (!set.includes(trigger)) set.push(trigger);
    await AsyncStorage.setItem(PROMPTED_TRIGGERS_KEY, JSON.stringify(set));
  } catch {
    /* best-effort — a lost flag just means Apple's own throttle catches it */
  }
}

// Fire-and-forget. Call after a real win; safe to call often (guards inside).
export async function maybeRequestReview(trigger: Trigger): Promise<void> {
  try {
    if (await alreadyPrompted(trigger)) return;
    if (await recentlyPrompted()) return;
    if (!(await StoreReview.hasAction())) return;
    // Small delay so the prompt lands after the celebration UI settles.
    setTimeout(async () => {
      try {
        await StoreReview.requestReview();
        await markPrompted(trigger);
      } catch {
        /* ignore */
      }
    }, 1200);
  } catch {
    /* never let a rating prompt affect the logging flow */
  }
}
