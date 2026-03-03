#!/usr/bin/env python3
import subprocess, re

DIR = "/Users/automus/.openclaw/workspace/FacelessChannel/images/operation-mincemeat"
INPUT = "/Users/automus/.openclaw/workspace/FacelessChannel/output/operation-mincemeat.mp4"
OUTPUT = "/Users/automus/.openclaw/workspace/FacelessChannel/output/operation-mincemeat-final.mp4"

# Parse VTT
vtt = open(f"{DIR}/voiceover.vtt").read()
blocks = re.findall(r'(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})\s*\n(.+?)(?=\n\n|\Z)', vtt, re.DOTALL)

def vtt_to_secs(t):
    h, m, s = t.split(':')
    return int(h)*3600 + int(m)*60 + float(s)

# Build drawtext filters
filters = []
for start, end, text in blocks:
    t1 = vtt_to_secs(start)
    t2 = vtt_to_secs(end)
    clean = text.strip().replace("'", "\u2019").replace('"', '\\"').replace(':', '\\:').replace(',', '\\,')
    # Wrap long lines (max ~30 chars per line)
    words = clean.split()
    lines = []
    current = ""
    for w in words:
        if len(current) + len(w) + 1 > 30:
            lines.append(current)
            current = w
        else:
            current = f"{current} {w}".strip()
    if current:
        lines.append(current)
    wrapped = "\\n".join(lines)
    
    filters.append(
        f"drawtext=text='{wrapped}'"
        f":fontsize=42:fontcolor=white:borderw=3:bordercolor=black"
        f":x=(w-text_w)/2:y=h-h/4"
        f":enable='between(t,{t1},{t2})'"
    )

filter_str = ",".join(filters)

cmd = [
    "ffmpeg", "-y", "-i", INPUT,
    "-vf", filter_str,
    "-c:a", "copy",
    "-c:v", "libx264", "-preset", "fast", "-crf", "23",
    "-pix_fmt", "yuv420p",
    OUTPUT
]

print(f"Adding {len(blocks)} caption blocks...")
result = subprocess.run(cmd, capture_output=True, text=True)
if result.returncode == 0:
    import os
    size = os.path.getsize(OUTPUT) / (1024*1024)
    print(f"✅ Final video: {OUTPUT} ({size:.1f} MB)")
else:
    print("❌ Error:", result.stderr[-500:])
