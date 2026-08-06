# Full-width webtoon panels

Six panels at **1080×1920**, pulled from the vertical hero clip rather than enlarged from
the contact sheet. This is real resolution, not an upscale: the clip is 1080×1920 to begin
with, so a frame from it is exactly the size a full-width phone panel needs.

Both watermarks are painted out, the same way they are for the hero clip.

| File | Beat | What is in it |
| --- | --- | --- |
| `01-greeting.jpg` | Greeting | Reading at the desk, wide |
| `02-calculating.jpg` | Where the numbers come from | The golden figure beginning to form |
| `03-figure.jpg` | The core number | The figure complete, his hand in it |
| `04-insight.jpg` | First insight | Fan in hand, looking down at the book |
| `05-facing.jpg` | The harder part | Fan raised, meeting the reader's eye |
| `06-closing.jpg` | Close | Close in, fan lowered |

884 KB for the set. They are page content rather than the hero, so they load as the reader
scrolls to them — a panel eight screens down should not be fetched before the first one is
on screen.

## Why these and not the character sheet

The sheet's cells are 242px. A full-width panel is 1080px, and no amount of filtering
invents the four-and-a-half times detail that would be missing. The expressions in
`../` stay useful at their own size — small character insets beside a speech bubble — and
these carry the panels. Between them the page needs no upscaling anywhere.

More beats can be cut from either supplied clip the same way; these six are the ones whose
composition already matches the reading's shape.
