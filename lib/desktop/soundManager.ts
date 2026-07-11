export type SoundName = "startup" | "click" | "error" | "notify" | "shutdown";

const FILES: Record<SoundName, string> = {
  startup: "/sounds/startup.mp3",
  click: "/sounds/click.mp3",
  error: "/sounds/error.mp3",
  notify: "/sounds/notify.mp3",
  shutdown: "/sounds/shutdown.mp3",
};

let enabled = false;

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

export function isSoundEnabled() {
  return enabled;
}

/**
 * No sound files are bundled yet (skipped in this pass — drop real .mp3/.wav
 * files into /public/sounds using the names in FILES above and this will
 * start playing them automatically once `setSoundEnabled(true)` is called
 * from Control Panel).
 */
export function playSound(name: SoundName) {
  if (!enabled) return;
  try {
    const audio = new Audio(FILES[name]);
    audio.volume = 0.5;
    void audio.play().catch(() => {
      /* file missing or blocked by autoplay policy — silently ignore */
    });
  } catch {
    // ignore
  }
}