#!/usr/bin/env python3
"""Build final video with Ken Burns + burned-in captions using PIL for text rendering"""
import subprocess, re, os, struct
from PIL import Image, ImageDraw, ImageFont

DIR = "/Users/automus/.openclaw/workspace/FacelessChannel/images/operation-mincemeat"
OUTPUT = "/Users/automus/.openclaw/workspace/FacelessChannel/output/operation-mincemeat-final.mp4"
VOICEOVER = f"{DIR}/voiceover.mp3"
FRAMES_DIR = f"{DIR}/frames"
os.makedirs(FRAMES_DIR, exist_ok=True)

W, H = 1080, 1920
FPS = 25

# Parse subtitles
vtt = open(f"{DIR}/voiceover.vtt").read()
subs = re.findall(r'(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})\s*\n(.+?)(?=\n\n|\n\d+\n|\Z)', vtt, re.DOTALL)

def to_secs(t):
    h, m, rest = t.split(':')
    s, ms = rest.split(',')
    return int(h)*3600 + int(m)*60 + int(s) + int(ms)/1000

parsed_subs = [(to_secs(s), to_secs(e), txt.strip()) for s, e, txt in subs]

# Get audio duration
dur = float(subprocess.check_output([
    "ffprobe", "-i", VOICEOVER, "-show_entries", "format=duration", "-v", "quiet", "-of", "csv=p=0"
]).decode().strip())

scene_dur = dur / 10
total_frames = int(dur * FPS)
scene_frames = int(scene_dur * FPS)

print(f"Duration: {dur:.1f}s, {total_frames} frames, {scene_frames} frames/scene")

# Load images
images = []
for i in range(1, 11):
    img = Image.open(f"{DIR}/scene{i:02d}.jpg").convert("RGB")
    # Scale to cover 1080x1920 with some extra for zoom
    scale = max(W * 1.2 / img.width, H * 1.2 / img.height)
    img = img.resize((int(img.width * scale), int(img.height * scale)), Image.LANCZOS)
    images.append(img)

# Try to find a bold font
font_path = None
for fp in ["/System/Library/Fonts/Supplemental/Arial Bold.ttf", 
           "/System/Library/Fonts/Helvetica.ttc",
           "/Library/Fonts/Arial Bold.ttf"]:
    if os.path.exists(fp):
        font_path = fp
        break

def get_font(size):
    if font_path:
        return ImageFont.truetype(font_path, size)
    return ImageFont.load_default()

def wrap_text(text, font, max_width, draw):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        bbox = draw.textbbox((0,0), test, font=font)
        if bbox[2] - bbox[0] > max_width and current:
            lines.append(current)
            current = word
        else:
            current = test
    if current:
        lines.append(current)
    return lines

def draw_caption(img, text):
    draw = ImageDraw.Draw(img)
    font = get_font(48)
    lines = wrap_text(text, font, W - 80, draw)
    
    line_height = 60
    total_h = len(lines) * line_height
    y_start = H - 350 - total_h // 2
    
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0,0), line, font=font)
        tw = bbox[2] - bbox[0]
        x = (W - tw) // 2
        y = y_start + i * line_height
        # Outline
        for dx in [-2,-1,0,1,2]:
            for dy in [-2,-1,0,1,2]:
                draw.text((x+dx, y+dy), line, font=font, fill="black")
        draw.text((x, y), line, font=font, fill="white")
    return img

# Generate frames via pipe to ffmpeg
print("Generating frames and encoding...")

cmd = [
    "ffmpeg", "-y",
    "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
    "-i", "pipe:0",
    "-i", VOICEOVER,
    "-c:v", "libx264", "-preset", "fast", "-crf", "23",
    "-c:a", "aac", "-b:a", "192k",
    "-shortest", "-pix_fmt", "yuv420p",
    OUTPUT
]

proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)

for frame_num in range(total_frames):
    scene_idx = min(frame_num // scene_frames, 9)
    local_frame = frame_num - scene_idx * scene_frames
    progress = local_frame / max(scene_frames - 1, 1)
    
    # Ken Burns: alternate zoom in/out
    src = images[scene_idx]
    if scene_idx % 2 == 0:
        zoom = 1.0 + 0.15 * progress  # zoom in
    else:
        zoom = 1.15 - 0.15 * progress  # zoom out
    
    cw = int(W / zoom)
    ch = int(H / zoom)
    cx = (src.width - cw) // 2
    cy = (src.height - ch) // 2
    
    frame = src.crop((cx, cy, cx + cw, cy + ch)).resize((W, H), Image.LANCZOS)
    
    # Add caption
    t = frame_num / FPS
    for s_start, s_end, s_text in parsed_subs:
        if s_start <= t <= s_end:
            frame = draw_caption(frame, s_text)
            break
    
    proc.stdin.write(frame.tobytes())
    
    if frame_num % 100 == 0:
        print(f"  Frame {frame_num}/{total_frames} ({100*frame_num//total_frames}%)")

proc.stdin.close()
proc.wait()

size = os.path.getsize(OUTPUT) / (1024*1024)
print(f"\n✅ Final video: {OUTPUT} ({size:.1f} MB)")
