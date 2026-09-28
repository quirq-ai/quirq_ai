# XO captured walkthrough exports

These silent videos use real local XO browser captures from 22 September 2026.
They are captured step-through walkthroughs at 4 fps, with pauses between capture
segments removed. They are not continuous native screen recordings. Product UI
is not generated or altered: an explicit crop removes the app sidebar and header,
and a separate 100px caption bar sits below the 1392 × 840 product viewport.

| Export             | Frames | Duration | H.264 MP4 size |
| ------------------ | -----: | -------: | -------------: |
| `setup-tour.mp4`   |     52 |      13s |  388,090 bytes |
| `pricing-tour.mp4` |     32 |       8s |  414,320 bytes |
| `usage-tour.mp4`   |     52 |      13s |  433,841 bytes |

All exports are 1392 × 940 at 4 fps. They live in
`public/assets/xo-ui/review-2026-09-22/`.
Each MP4 has a matching WebVTT caption track generated from the same caption
configuration, preserving the visible step text and capture qualifications.

## Re-export on macOS

The exporter uses system AVFoundation, CoreGraphics, CoreText and VideoToolbox.
No package installation, ffmpeg or remote service is required. Compile from the
`latest` application directory:

```sh
/usr/bin/swiftc -module-cache-path /private/tmp/quirq-swift-module-cache scripts/export-xo-tour.swift -o /private/tmp/quirq-export-xo-tour
```

Then export a capture directory with its matching JSON caption configuration:

```sh
/private/tmp/quirq-export-xo-tour /private/tmp/quirq-xo-review-20260922/setup-v2 public/assets/xo-ui/review-2026-09-22/setup-tour.mp4 docs/reviews/xo-setup-tour-captions.json --overwrite
/private/tmp/quirq-export-xo-tour /private/tmp/quirq-xo-review-20260922/pricing-v2 public/assets/xo-ui/review-2026-09-22/pricing-tour.mp4 docs/reviews/xo-pricing-tour-captions.json --overwrite
/private/tmp/quirq-export-xo-tour /private/tmp/quirq-xo-review-20260922/usage-v2 public/assets/xo-ui/review-2026-09-22/usage-tour.mp4 docs/reviews/xo-usage-tour-captions.json --overwrite
```

The temporary capture directories are local working inputs, not public website
assets. Each contains a contiguous sequence named `00000.png`, `00001.png`, and
so on. Caption ranges are inclusive frame indexes. The optional `crop` is in
source-image pixels: these captures use x=48, y=64, width=1392, height=840 within
1440 × 960 PNGs. The original incorrectly scaled `setup` and `pricing` capture
directories are not inputs to these exports.

The encoder refuses gaps, inconsistent dimensions, missing or overlapping
captions, over-wide caption text, and existing outputs unless `--overwrite` is
explicit. macOS codec services must be available to the process; this environment
required permission for local codec access outside the filesystem sandbox.

## Verification and limits

The exporter checks AVFoundation playability, dimensions and duration, then
decodes every frame with AVAssetReader and checks the decoded frame count.
A decoded first-frame PNG is written to the system temporary directory under
`quirq-tour-verification` for visual inspection. All three decoded opening frames
were checked for correct orientation, crop and readable captions.
Apple Vision OCR checked the exported crop of all 136 source frames (24 unique
cropped images after exact hash deduplication); no email-address patterns were
detected. The crop excludes the profile sidebar and breadcrumb header.

- Setup stops before **Create Space**. No computer was provisioned.
- Pricing demonstrates monthly versus annual totals. No subscription was changed.
- Usage shows an empty activity state. The metrics concern model usage, not a
  compute invoice; the capture does not demonstrate completed agent work.

The source review and browser verification record are maintained separately in
`xo-platform-2026-09-22.md`.
