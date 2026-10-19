#!/usr/bin/env bash
# Render transition demos for review: transitions/<slug>/demo.html -> preview.mp4 + contact.png.
# Usage: scripts/render.sh <slug> [<slug>...]   |   scripts/render.sh --all
# contact.png is 12 frames spanning the transition window declared in the demo's
# <meta name="hf-transition" content="start=<s>;duration=<s>">, so the handoff can be checked as stills.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

render_one() {
  local slug="$1" dir="transitions/$1"
  [ -f "$dir/demo.html" ] || { echo "✗ $slug: no $dir/demo.html" >&2; return 1; }

  hyperframes render -c "$dir/demo.html" --fps 30 --quality looks --strict --quiet --workers 2 \
    --output "$dir/preview.mp4" >"$dir/.render.log" 2>&1 \
    || { echo "✗ $slug: render failed (see $dir/.render.log)" >&2; tail -20 "$dir/.render.log" >&2; return 1; }

  local meta start dur total
  meta="$(grep -o 'name="hf-transition" content="[^"]*"' "$dir/demo.html" | sed 's/.*content="//; s/"$//')"
  start="$(sed -n 's/.*start=\([0-9.]*\).*/\1/p' <<<"$meta")"
  dur="$(sed -n 's/.*duration=\([0-9.]*\).*/\1/p' <<<"$meta")"
  [ -n "$start" ] && [ -n "$dur" ] || { echo "✗ $slug: missing <meta name=\"hf-transition\" content=\"start=..;duration=..\">" >&2; return 1; }

  # Window: 0.2s before the transition to 0.3s after it, clamped to the clip.
  total="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$dir/preview.mp4")"
  read -r ws wl < <(awk -v s="$start" -v d="$dur" -v t="$total" 'BEGIN{a=s-0.2; if(a<0)a=0; b=s+d+0.3; if(b>t)b=t; printf "%.3f %.3f\n", a, b-a}')
  ffmpeg -v error -y -ss "$ws" -t "$wl" -i "$dir/preview.mp4" \
    -vf "fps=12/$wl,scale=480:-1,tile=4x3:padding=4:color=white" -frames:v 1 "$dir/contact.png"

  rm -f "$dir/.render.log"
  printf '✓ %s  %ss clip, transition %ss @ %ss\n' "$slug" "$(printf '%.1f' "$total")" "$dur" "$start"
}

if [ "${1:-}" = "--all" ]; then
  set -- $(ls transitions)
fi
[ $# -gt 0 ] || { echo "usage: $0 <slug>... | --all" >&2; exit 2; }

fail=0
for slug in "$@"; do render_one "$slug" || fail=1; done
node "$ROOT/scripts/gallery.mjs" >/dev/null
exit $fail
