#!/usr/bin/env python3
import subprocess, os

DIR = "/Users/automus/.openclaw/workspace/FacelessChannel/images/operation-mincemeat"
OUTPUT = "/Users/automus/.openclaw/workspace/FacelessChannel/output/operation-mincemeat.mp4"
VOICEOVER = f"{DIR}/voiceover.mp3"

# Get duration
dur = float(subprocess.check_output([
    "ffprobe", "-i", VOICEOVER, "-show_entries", "format=duration",
    "-v", "quiet", "-of", "csv=p=0"
]).decode().strip())

scene_dur = dur / 10
frames = int(scene_dur * 25)
print(f"Total: {dur:.1f}s, per scene: {scene_dur:.1f}s, frames/scene: {frames}")

inputs = []
filters = []
concat_parts = []

for i in range(1, 11):
    idx = f"{i:02d}"
    img = f"{DIR}/scene{idx}.jpg"
    inputs.extend(["-loop", "1", "-t", str(scene_dur), "-i", img])
    
    if i % 2 == 0:
        z_expr = f"1.15-0.15*on/{frames}"
    else:
        z_expr = f"min(1.15,1+0.15*on/{frames})"
    
    x_expr = "iw/2-(iw/zoom/2)"
    y_expr = "ih/2-(ih/zoom/2)"
    
    filters.append(
        f"[{i-1}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,"
        f"zoompan=z='{z_expr}':x='{x_expr}':y='{y_expr}':d={frames}:s=1080x1920:fps=25[v{i}]"
    )
    concat_parts.append(f"[v{i}]")

filter_complex = ";".join(filters) + f";{''.join(concat_parts)}concat=n=10:v=1:a=0[outv]"

cmd = [
    "ffmpeg", "-y",
    *inputs,
    "-i", VOICEOVER,
    "-filter_complex", filter_complex,
    "-map", "[outv]", "-map", "10:a",
    "-c:v", "libx264", "-preset", "fast", "-crf", "23",
    "-c:a", "aac", "-b:a", "192k",
    "-shortest",
    "-pix_fmt", "yuv420p",
    OUTPUT
]

print("Building video...")
result = subprocess.run(cmd, capture_output=True, text=True)
if result.returncode == 0:
    size = os.path.getsize(OUTPUT) / (1024*1024)
    print(f"✅ Done! {OUTPUT} ({size:.1f} MB)")
else:
    print("❌ Error:")
    print(result.stderr[-1000:])
