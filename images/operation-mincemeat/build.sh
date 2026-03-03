#!/bin/bash
set -e

DIR="/Users/automus/.openclaw/workspace/FacelessChannel/images/operation-mincemeat"
OUTPUT="/Users/automus/.openclaw/workspace/FacelessChannel/output/operation-mincemeat.mp4"
VOICEOVER="$DIR/voiceover.mp3"

# Get total duration
DURATION=$(ffprobe -i "$VOICEOVER" -show_entries format=duration -v quiet -of csv="p=0" | cut -d. -f1)
SCENE_DUR=$(echo "$DURATION / 10" | bc)

echo "Total duration: ${DURATION}s, per scene: ${SCENE_DUR}s"

# Build filter complex for Ken Burns (slow zoom) + concatenation
INPUTS=""
FILTER=""
CONCAT=""

for i in $(seq 1 10); do
    IDX=$(printf "%02d" $i)
    INPUTS="$INPUTS -loop 1 -t $SCENE_DUR -i $DIR/scene${IDX}.jpg"
    
    # Alternate between zoom-in and zoom-out for variety
    if [ $((i % 2)) -eq 0 ]; then
        # Zoom out (start zoomed, pull back)
        FILTER="${FILTER}[$((i-1)):v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='1.15-0.15*on/($SCENE_DUR*25)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((SCENE_DUR*25)):s=1080x1920:fps=25[v${i}];"
    else
        # Zoom in
        FILTER="${FILTER}[$((i-1)):v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(1.15,1+0.15*on/($SCENE_DUR*25))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((SCENE_DUR*25)):s=1080x1920:fps=25[v${i}];"
    fi
    CONCAT="${CONCAT}[v${i}]"
done

FILTER="${FILTER}${CONCAT}concat=n=10:v=1:a=0[outv]"

echo "Building video..."
eval ffmpeg -y $INPUTS -i "$VOICEOVER" \
    -filter_complex "$FILTER" \
    -map "[outv]" -map 10:a \
    -c:v libx264 -preset fast -crf 23 \
    -c:a aac -b:a 192k \
    -shortest \
    -pix_fmt yuv420p \
    "$OUTPUT" 2>&1 | tail -5

echo "✅ Video saved to: $OUTPUT"
