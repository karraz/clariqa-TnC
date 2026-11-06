# Handover: MPI company dinner videos (status at 06:03 UTC, 6 Nov 2026)

Client: Malaysian Pharmaceutical Industries Sdn. Bhd. (MPI), Penang. The videos are for the **company dinner tonight**. User: on iPhone, writes in Malay and English. Everything is built with HyperFrames.

## 1. Done and delivered in chat (full + "small" 1080p versions)
| # | File (/home/user/mpi2/renders/) | Length | Voice | Notes |
|---|---|---|---|---|
| V1 | MPI-Dinner-V1-Gala-Gold.mp4 | 1:58 | Ryan | black and gold, elegant |
| V2 | MPI-Dinner-V2-Brand-Bold.mp4 | 1:58 | Ryan | MPI orange and blue, kinetic type |
| V3 | MPI-Dinner-V3-Clean-Corporate.mp4 | 1:58 | Sonia | white and blue, annual-report look (audio −1 dB post) |
| V4 | MPI-Dinner-V4-Family-Album.mp4 | 1:58 | Sonia | warm photo album (audio −1.5 dB post) |
| V5 | MPI-Dinner-V5-Cinematic-Epic.mp4 | 1:58 | Ryan | trailer style; verified 3,540 frames |
| V7 | MPI-Dinner-V7-Countdown-Reveal.mp4 | 1:42 | Christopher | suspense, hook, counters |

Small phone copies (13–22 MB): `/tmp/claude-0/-home-user-clariqa-TnC/86e3a531-f678-562b-9a6a-37ad2d1122d7/scratchpad/dinner_small/`. Recipe:
`ffmpeg -i IN.mp4 -c:v libx264 -preset faster -crf 25 -maxrate 3M -bufsize 6M -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart OUT-1080p-small.mp4`

## 2. In progress (renders run one at a time; global lock at /root/.cache/hyperframes/locks/render.lock)
1. **V6 "The Trust Code"** (suspense): project `/home/user/mpi2/variants/v6-suspense-thriller/`, output `MPI-Dinner-V6-Suspense-Thriller.mp4`, started 02:18, now on its last section (the end card compresses to almost nothing, so the file barely grows; it is not hung). The user chose to let V6 finish first. **Do not kill it.**
2. **Story montage** (the user's own 5-act script; top priority after V6): it is queued detached and starts automatically when V6 frees the lock.
   - Render copy: `/home/user/mpi2/variants/s1-fast/` (a copy of `s1-story-montage/` with all 85 `data-color-grading` attrs removed, because the WebGL grade runs in software and costs about 2.2 s per frame).
   - Output: `/home/user/mpi2/renders/MPI-Dinner-Story-Montage-raw.mp4`; log `renders/story.log`; it writes `renders/story.done` when finished.
   - **After it finishes:** (a) apply one global grade with ffmpeg, e.g. `-vf "eq=contrast=1.06:saturation=1.08,colorbalance=rs=.03:bs=-.03,vignette=PI/5"`, keep the audio (`-c:a copy`), and save as `MPI-Dinner-Story-Montage.mp4`; (b) check loudness (`ffmpeg -af ebur128=peak=true`), aiming for −16 to −14 LUFS; if louder, lower it with `-c:v copy -af volume=-XdB`; (c) make a contact sheet and look at it; (d) make the small version; (e) send both to the user.
   - Story: I The World Begins (airplane over the factory, c39 + jet sfx) → II People Behind the Promise → III Precision in Every Move → IV Every Step Forward (captioned upgrades; the NPRA audit is a type card because there is no photo) → V The Final Hero Is Us → "ONE TEAM. ONE JOURNEY. A FUTURE WE BUILD TOGETHER." → logo. 125 s, voice Ryan, HeyGen-library anthem.
   - Brief: `/home/user/mpi2/story/BRIEF_STORY.md`.

## 3. Key paths
- Shared kit: `/home/user/mpi2/kit/` (BRIEF.md, shots.json, all_tags.json, brand logos, vo/, music/, suspense/)
- Photos: `/home/user/mpi2/lib/photos/pNNN.jpg` (422) with sheets in `lib/sheets/`; clips: `lib/clips/cNN.mp4` (42) with logs `lib/cliplog_1.json`, `lib/cliplog_2.json`; photo story picks `lib/photo_story.json`
- Source Drive folder (public): https://drive.google.com/drive/folders/1CSSdMW9v7wGwdjN0wuYJOInmOgsrdyJy
- Logo: https://mpi.com.my/wp-content/uploads/2025/11/LatestLogo.png (orange #F85700, blue #0073D3)

## 4. Constraints and decisions already made
- **Google Drive upload of videos is not possible from this session.** The Drive connector only accepts inline base64, and there's no Google auth. The output folder "MPI Corporate Film – 5 Corporate Variations" (https://drive.google.com/drive/folders/117fOKwUGPwmXt__Ib1IyULYI7x8iZ9aF) holds only the guide doc. The user saves the videos manually: Share → Save to Files → Google Drive.
- Voice: edge-tts (free Microsoft neural: Ryan / Sonia / Christopher) in `/home/user/mpi2/tts/` venv; its certifi has the proxy CA appended. HeyGen voices need a paid Pro plan, which wasn't purchased.
- Music: V1–V5 are Jamendo CC BY 3.0 tracks (credits on the end cards and in `kit/music/credits.json`); V6, V7 and the montage use the HeyGen audio library.
- Verified facts only: 1983, 42+ years, Penang, GMP-certified, generic medicines, 10 product categories, "Supplying Quality Medicine Nationwide", tagline "Delivering Trusted Pharmaceutical Solutions". Not used: staff count and PIC/S (sources conflict), NPRA audit photos and email (none supplied).
- Excluded footage: c13 193–197.5 (children), c13 232–244.5 (possible minors), finance screens, car number plates.
- Killing other agents' render processes was blocked by the permission classifier; ask the user before reprioritising.

## 5. Earlier work (first request, 5 Nov)
Five "corporate wrapper" variants of the original 2:00 MPI film (`/home/user/mpi/`, outputs in `/home/user/mpi/renders/`) were delivered. Superseded by the dinner set above.
