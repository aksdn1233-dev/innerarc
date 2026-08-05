# Hero clip for 태율 (太律)

The opening screen plays a looping clip of the character when one is published here. Until
then it shows `/images/taeyul-hero.jpg` as the video's poster, which fills the same frame —
so a missing clip looks deliberate rather than broken, and installing one is a file copy
with no code change.

## What to drop in

`public/videos/taeyul-hero.mp4` — H.264, `yuv420p`, `+faststart`.

Only the MP4 is published. A VP9 WebM was encoded alongside it and came out *larger* than
the H.264 at matching quality, so it was dropped: H.264 plays in every browser in use, and
a second file that is never the smaller one is weight for nothing.

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

The clip in place was produced from a 1920×1080 source with three steps, which is the
recipe to repeat for a replacement:

```sh
ffmpeg -i source.mp4 -filter_complex "
[0:v]delogo=x=1595:y=995:w=305:h=62,crop=608:1080:760:0,fps=24,format=yuv420p[v];
[v]split=3[s0][s1][s2];
[s0]trim=0:5.44,setpts=PTS-STARTPTS[body];
[s1]trim=5.44:6.24,setpts=PTS-STARTPTS[tail];
[s2]trim=0:0.8,setpts=PTS-STARTPTS[head];
[tail][head]blend=all_expr='A*(1-(T/0.8))+B*(T/0.8)'[mix];
[body][mix]concat=n=2:v=1:a=0[out]" -map "[out]" -an \
  -c:v libx264 -profile:v main -pix_fmt yuv420p -crf 30 -preset slow \
  -movflags +faststart taeyul-hero.mp4
```

- **`delogo`** paints out the generator's watermark by reconstructing the box from the
  pixels around it. The box must not touch a frame edge or it has nothing to sample.
- **`crop=608:1080`** takes a 9:16 column centred on him, which is a phone's own shape, so
  the opening screen crops almost nothing.
- **The `blend` and `concat`** cross-fade the last 0.8s back into the first frame. Without
  it the clip cuts from its closing shot to its opening one every seven seconds.
- **`-an`** drops the audio track, which is what keeps autoplay allowed.

Then take the poster from the clip's own first frame, so the still and the moving picture
are the same image and nothing jumps when playback starts:

```sh
ffmpeg -ss 0.04 -i taeyul-hero.mp4 -q:v 8 -frames:v 1 ../images/taeyul-hero.jpg
```

## If the clip changes shape

The crop is set by `.cinema-hero-portrait` in `src/app/globals.css` (`object-position`, and
the `mask-image` that fades it into the sky). A clip framed differently from the still may
want those numbers adjusted.

## Accessibility

The clip is decorative and hidden from assistive technology — the headline beside it
carries the meaning. It does not start at all for a visitor who has asked for reduced
motion; they keep the still poster.
