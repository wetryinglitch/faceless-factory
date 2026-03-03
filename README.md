# Faceless Factory — Video Pipeline

Automated pipeline for creating faceless YouTube Shorts / TikTok / IG Reels content.

## Overview

Faceless Factory takes a topic and produces a complete vertical short-form video with AI-generated script, images, voiceover, Ken Burns animation, and burned-in captions.

## Pipeline Stages

### Stage 1: Script Generation
- **Tool:** Claude API (Anthropic)
- **Input:** Topic + category
- **Output:** 60-second script with 9-10 timestamped scenes
- **Location:** `output/scripts/{topic}.md`
- **How:** Use the web UI at `http://localhost:8889` or hit the `/generate-script` API endpoint

### Stage 2: Image Generation
- **Tool:** Google Gemini (nano banana) — `gemini-2.0-flash-exp-image-generation` model
- **Input:** Scene-by-scene prompts derived from the script
- **Output:** 10 images, 1080x1920 vertical format
- **Location:** `images/{topic}/scene01.jpg` through `scene10.jpg`
- **How:** Currently manual — paste prompts into Gemini web app (gemini.google.com)
- **Prompt format:** Descriptive cinematic scene + `vertical format, 1080x1920, 9:16 aspect ratio`
- **Note:** Gemini blocks real historical figures (Hitler, etc.) — use generic/shadowy alternatives
- **API:** Requires paid Google AI plan for API access. Free tier works via web app.

### Stage 3: Voiceover (TTS)
- **Tool:** edge-tts (Microsoft Edge TTS, free)
- **Voice:** `en-US-ChristopherNeural`
- **Rate:** `+10%` (natural pace, fits ~57s for a simplified script)
- **Output:** `images/{topic}/voiceover.mp3` + `voiceover.vtt` (subtitles)
- **Command:**
  ```bash
  python3 -m edge_tts --voice "en-US-ChristopherNeural" --rate="+10%" \
    --file /tmp/narration.txt \
    --write-media images/{topic}/voiceover.mp3 \
    --write-subtitles images/{topic}/voiceover.vtt
  ```
- **Tip:** If script is too long for 60s, simplify the script rather than speeding up the voice

### Stage 4: Video Assembly
- **Tool:** Python script (`build_final.py`) using PIL + ffmpeg
- **Effects:**
  - Ken Burns (alternating zoom in/out per scene)
  - Burned-in captions (white text, black outline, no background box)
  - Audio layered underneath
- **Output:** `output/{topic}-final.mp4`
- **Specs:** 1080x1920, 25fps, libx264, ~12-14 MB
- **Render time:** ~3-5 minutes on Mac mini (1,500+ frames via PIL)
- **Command:**
  ```bash
  python3 images/{topic}/build_final.py
  ```

### Stage 5: Publish (Manual)
- Upload to YouTube Shorts / TikTok / IG Reels
- Add title, description, tags, hashtags

## Project Structure

```
FacelessChannel/
├── app/
│   ├── index.html          # Web UI (Faceless Factory dashboard)
│   └── api/
│       └── server.js       # API server (script generation, queue management)
├── credentials/
│   ├── anthropic_api_key.txt
│   └── gemini_api_key.txt
├── images/
│   └── {topic}/
│       ├── scene01.jpg - scene10.jpg  # Generated images
│       ├── voiceover.mp3              # TTS narration
│       ├── voiceover.vtt              # Subtitle timestamps
│       ├── build_final.py             # Video assembly script
│       └── build.py                   # Base video (no captions)
├── output/
│   ├── scripts/            # Generated scripts (.md files)
│   └── {topic}-final.mp4   # Finished videos
└── queue/                  # Pending script generation jobs
```

## Web UI

Start the server:
```bash
cd app/api && node server.js
```
Access at: `http://localhost:8889`

**Features:**
- Browse existing scripts
- Generate new scripts by topic
- Queue management for batch processing

## Available Scripts

| Topic | File |
|-------|------|
| Acoustic Kitty | `output/scripts/acoustic-kitty.md` |
| Bat Bombs | `output/scripts/bat-bombs.md` |
| Ekranoplan | `output/scripts/ekranoplan.md` |
| Ghost Army | `output/scripts/ghost-army.md` |
| Ghost Soldiers | `output/scripts/ghost-soldiers.md` |
| MKUltra | `output/scripts/mkultra.md` |
| Night Witches | `output/scripts/night-witches.md` |
| Operation Mincemeat | `output/scripts/operation-mincemeat.md` |
| Operation Paperclip | `output/scripts/operation-paperclip.md` |
| Project Pluto | `output/scripts/project-pluto.md` |
| Tsar Tank | `output/scripts/tsar-tank.md` |

## Quick Start — New Video

1. **Generate script** via UI or pick from existing scripts
2. **Create image prompts** — ask Automus to generate prompts from the script
3. **Generate images** — paste prompts into Gemini (gemini.google.com), save as `scene01-10.jpg`
4. **Drop images** into `images/{topic}/` folder
5. **Generate voiceover:**
   ```bash
   python3 -m edge_tts --voice "en-US-ChristopherNeural" --rate="+10%" \
     --file /tmp/narration.txt \
     --write-media images/{topic}/voiceover.mp3 \
     --write-subtitles images/{topic}/voiceover.vtt
   ```
6. **Copy build script** from an existing topic and run it
7. **Review** the final MP4 and upload

## API Keys

| Service | Location | Plan |
|---------|----------|------|
| Anthropic (Claude) | `credentials/anthropic_api_key.txt` | API |
| Google Gemini | `credentials/gemini_api_key.txt` | Free tier (web) / Paid (API) |

## Dependencies

- **Python 3.9+**
- **ffmpeg** (via Homebrew)
- **edge-tts:** `pip3 install edge-tts`
- **Pillow:** `pip3 install Pillow`
- **Node.js** (for web UI server)

## Known Limitations

- Image generation is manual (Gemini API requires paid plan for programmatic access)
- ffmpeg on this machine lacks `drawtext` and `subtitles` filters — captions are burned in via PIL (slower)
- Render takes 3-5 min per video due to frame-by-frame PIL processing
- Script may need manual simplification to fit 60s at natural speech pace

## Future Improvements

- [ ] Automate image gen via Gemini API (once billing enabled)
- [ ] Install ffmpeg with full filter support for faster caption rendering
- [ ] Add background music layer
- [ ] Batch pipeline — generate multiple videos in sequence
- [ ] Auto-upload to YouTube/TikTok via API
- [ ] Word-level caption highlighting (like CapCut style)
