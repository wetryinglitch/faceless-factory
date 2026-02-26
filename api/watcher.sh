#!/bin/bash
# Watch the queue dir and notify when new files appear
QUEUE_DIR="/Users/automus/.openclaw/workspace/FacelessChannel/queue"

echo "👁️ Watching $QUEUE_DIR for new script requests..."

fswatch -0 "$QUEUE_DIR" | while read -d "" event; do
  if [[ "$event" == *.json ]]; then
    echo "📥 New request: $event"
    # Touch a trigger file that the cron can check
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > /tmp/faceless-factory-trigger
  fi
done
