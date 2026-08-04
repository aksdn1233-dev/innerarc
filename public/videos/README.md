# Hero clip for 태율 (太律)

The opening screen plays a looping clip of the character when one is published here. Until
then it shows `/images/taeyul-hero.jpg` as the video's poster, which fills the same frame —
so a missing clip looks deliberate rather than broken, and installing one is a file copy
with no code change.

## What to drop in

| Path | Format | Required |
| --- | --- | --- |
| `public/videos/taeyul-hero.webm` | VP9 or AV1 | preferred, tried first |
| `public/videos/taeyul-hero.mp4` | H.264 (`yuv420p`, `+faststart`) | fallback for Safari |

Publish both if you can. Safari does not play VP9 in every version, and the `.mp4` is what
it falls back to.

## What the clip has to be

- **Silent.** It plays muted and autoplaying; a browser blocks an autoplaying clip with
  sound, and the poster would sit there instead.
- **Seamlessly looping.** It repeats forever with no fade and no gap, so the last frame has
  to meet the first. A held breath, a turn of the head, the bells swaying — anything whose
  end returns to its beginning.
- **Portrait, roughly 3:4 or taller.** It is cropped to `object-fit: cover`, centred near
  `62% 12%` on a phone, so keep his face in the upper middle and leave room at the bottom
  where the title and buttons sit over it.
- **1080×1440 or larger.** Smaller than that softens on a modern phone screen.
- **Under about 1.5 MB**, ideally under 800 KB. It is fetched after first paint so it does
  not count against the page's initial payload budget, but it is still a download on a
  phone. Six to ten seconds at a modest bitrate is the target; a long clip is not needed
  because it loops.
- **Dark, in the character's palette.** White text sits on top of it. Eclipse `#1F1D2B`,
  Deep Purple `#4B2E63`, Almond Milk `#DCCFA1`.

## Encoding

With `ffmpeg`, from a source clip:

```sh
# WebM (VP9)
ffmpeg -i source.mov -an -c:v libvpx-vp9 -b:v 700k -crf 34 -vf scale=1080:-2 taeyul-hero.webm

# MP4 (H.264) — yuv420p and faststart are what make it play everywhere and start quickly
ffmpeg -i source.mov -an -c:v libx264 -profile:v main -pix_fmt yuv420p \
  -b:v 900k -movflags +faststart -vf scale=1080:-2 taeyul-hero.mp4
```

`-an` drops the audio track, which is what keeps autoplay allowed.

## If the clip changes shape

The crop is set by `.cinema-hero-portrait` in `src/app/globals.css` (`object-position`, and
the `mask-image` that fades it into the sky). A clip framed differently from the still may
want those numbers adjusted.

## Accessibility

The clip is decorative and hidden from assistive technology — the headline beside it
carries the meaning. It does not start at all for a visitor who has asked for reduced
motion; they keep the still poster.
