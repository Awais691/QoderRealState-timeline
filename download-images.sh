#!/usr/bin/env bash
mkdir -p assets/images
FAILED=""
while IFS=$'\t' read -r path id w h; do
  [ -z "$path" ] && continue
  dest="assets/images/$path"
  url="https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80&fm=jpg"
  code=$(curl -sS -L --max-time 90 -o "$dest" -w "%{http_code}" "$url" 2>/dev/null)
  if [ "$code" != "200" ]; then
    echo "FAIL $code $path ($id)"
    FAILED="$FAILED $path:$code"
    rm -f "$dest"
  else
    echo "OK   $path"
  fi
done < image-manifest.tsv
echo "=== FAILED:$FAILED"
