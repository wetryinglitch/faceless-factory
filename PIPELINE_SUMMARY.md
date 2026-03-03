# Faceless YouTube Video Pipeline
## How It All Works (The Quick Version)

---

## What Is This?

A system for producing 60-second YouTube Shorts and TikToks about obscure, fascinating topics -- without ever showing your face. Everything from research to upload is structured into a repeatable pipeline that runs about 45 minutes per video.

---

## The Content

**365 videos** across 4 categories:

| Category | Videos | What It Covers |
|----------|--------|----------------|
| Micro Militaries | 100 | Secret WWII units, forgotten conflicts, elite forces |
| Forgotten Technology | 100 | Soviet machines, lost inventions, abandoned projects |
| National Theatre | 100 | Kabuki, Kathakali, shadow puppetry, global traditions |
| Micro Niches | 65 | Strange jobs, hidden subcultures, forgotten places |

**Why these niches?** Low competition, high shareability, built-in "you won't believe this" factor. Each topic has a natural hook that grabs attention in 3 seconds.

---

## The Pipeline (5 Steps)

```
Research ──> Script ──> Images ──> Video ──> Upload
  5 min      8 min     12 min    15 min     5 min
                                            ─────
                                        ~45 min total
```

### Step 1: Research (5 min)
- Pick a topic from the 365-topic master list
- Cross-reference 2-3 sources (Wikipedia, Smithsonian, Google Scholar)
- Note specific numbers, dates, and names
- Validate with Bird CLI trending search

### Step 2: Script (8 min)
- Feed research notes into Claude with a structured prompt
- Output: 10-fact script with a dramatic arc
- Format: Hook (0-3s) > 9 facts > CTA (57-60s)
- Fact #6 is always the most shocking -- the "holy shit" moment
- Human reviews for accuracy and punchiness

### Step 3: Images (12 min)
- **Public domain:** Wikimedia Commons, Library of Congress, Smithsonian
- **AI-generated:** Midjourney with category-specific prompt templates
- **Local generation:** Nano Banana Pro skill (runs locally via OpenClaw)
- 10 images per video, all 9:16 vertical
- Organized into batch folders: `batch-001/001-ghost-army/images/`

### Step 4: Video Assembly (15 min)
- Tool: CapCut (desktop)
- Import 10 images + voiceover audio
- Each image gets ~6 seconds, timed to the script
- Voiceover: Record yourself or generate with ElevenLabs TTS (voice: "Adam")
- Auto-captions: white text, black outline, Arial Bold
- Background music at 10-15% volume
- Slow zoom on the Fact #6 image for emphasis
- Export: 1080x1920, 30fps, MP4

### Step 5: Upload & Schedule (5 min)
- YouTube: SEO title, description with sources, hashtags, custom thumbnail
- TikTok: Same video, shorter caption, trending hashtags
- Schedule via Later.com for optimal posting times (2-4 PM EST YouTube, 7-9 PM EST TikTok)

---

## The Script Formula

Every video follows this structure:

```
[0-3s]   HOOK      "They fooled the entire German army..."
[3-9s]   FACT 1    What it was, when it started
[9-15s]  FACT 2    The mission or purpose
[15-21s] FACT 3    How it worked
[21-27s] FACT 4    The risk or danger
[27-33s] FACT 5    The scale (specific numbers)
[33-39s] FACT 6    THE MOST SHOCKING FACT  <-- the money shot
[39-45s] FACT 7    Human element / personal story
[45-51s] FACT 8    Results and impact
[51-57s] FACT 9    What happened to it
[57-60s] FACT 10   Legacy + call to action
```

**Rules:**
- Use specific numbers, never "many" or "a lot"
- Include at least one named person
- Simple vocabulary (8th grade reading level)
- CTA always asks a question to drive comments

---

## Batch Production System

Scripts are generated in batches of 20. Each batch gets its own folder with individual video directories containing a `RESEARCH_AND_SCRIPT.md` file plus 10 Midjourney prompts.

### Current Progress

| Batch | Videos | Category | Status |
|-------|--------|----------|--------|
| 001 | 001-020 | WWII Secret Units | Complete |
| 002 | 021-040 | More Military + Code Talkers | Complete |
| 003 | 041-060 | Forgotten Technology | Complete |
| 004 | 061-080 | National Theatre | Complete |
| 005 | 081-100 | Micro Niches (Strange Jobs) | 2/20 done |

**82 video scripts ready to produce** -- enough for 16+ weeks of daily content.

---

## Tools & Costs

### Core Stack

| Tool | What It Does | Cost |
|------|-------------|------|
| Claude | Script generation & research | $20/mo |
| Midjourney | AI image generation | $10-30/mo |
| Nano Banana Pro | Local image generation (OpenClaw skill) | Free |
| CapCut | Video editing | Free |
| Bird CLI | Twitter/X trend validation | Free |
| ElevenLabs | Text-to-speech voiceover (optional) | $5-22/mo |
| Later.com | Social scheduling | Free tier |
| Canva | Thumbnails | Free |

**Monthly cost to run: $35-87**
**Per-video cost: ~$1 in API/generation fees + your time**

---

## The Workflow Strategy (v2.0)

The pipeline evolved from "generate everything upfront" to a research-driven approach:

1. **Validate** (Week 1) -- Make 5 videos, measure performance
2. **Analyze** (Week 2) -- Find what worked, identify patterns
3. **Scale** (Week 3+) -- Double down on winners, templatize everything

**Key insight:** Lead with military content (highest viral potential), crossover into tech, save theatre for after the channel is established.

---

## Folder Structure

```
FacelessChannel/
├── content/
│   ├── scripts/
│   │   ├── CONTENT_IDEAS_MICRO_NICHES.md    (365 topics)
│   │   └── SCRIPT_TEMPLATES_MICRO_NICHES.md (prompt templates)
│   └── batches/
│       ├── batch-001/  (001-020, WWII Secret Units)
│       ├── batch-002/  (021-040, More Military)
│       ├── batch-003/  (041-060, Forgotten Tech)
│       ├── batch-004/  (061-080, National Theatre)
│       └── batch-005/  (081-100, Micro Niches)
├── docs/
│   ├── COMPLETE_WORKFLOW.md          (detailed step-by-step)
│   ├── OPTIMIZED_WORKFLOW_2.0.md     (research-driven approach)
│   ├── PRODUCTION_MASTER_GUIDE.md    (full production guide)
│   ├── PRODUCTION_CHECKLIST.md       (daily/weekly checklists)
│   ├── QUICK_REFERENCE.md           (copy-paste prompts)
│   ├── VIDEO_001_WALKTHROUGH.md      (first video tutorial)
│   ├── RESEARCH_TOOLS_GUIDE.md       (Bird CLI & validation)
│   └── PROJECT_SUMMARY_MICRO_NICHES.md
├── analytics/
│   └── BATCH_TRACKING.md            (production dashboard)
└── PIPELINE_SUMMARY.md              (this file)
```

---

## Top 10 Videos to Produce First

Ranked by viral potential:

1. **Operation Mincemeat** -- Dead body fooled Hitler
2. **Ekranoplan** -- Soviet sea monster vehicle
3. **Ghost Army** -- Inflatable tanks that won WWII
4. **Project Pluto** -- Nuclear weapon too dangerous to build
5. **Bat Bombs** -- US military weaponized bats
6. **MKUltra** -- CIA mind control experiments
7. **Tsar Tank** -- Russia's epic engineering failure
8. **Acoustic Kitty** -- $20M CIA spy cat hit by a taxi
9. **Operation Paperclip** -- US hired Nazi scientists
10. **Ghost Soldiers** -- Greatest POW rescue in history

---

## Revenue Targets

| Timeline | Subscribers | Monthly Revenue |
|----------|-------------|-----------------|
| Month 3 | 25,000 | $1,500 |
| Month 6 | 75,000 | $5,000 |
| Month 12 | 200,000 | $15,000 |

---

*Last updated: February 25, 2026*
