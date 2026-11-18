#!/usr/bin/env bash
# Converts every JPG/PNG in assets/images/originals/ into the two WebP sizes the
# site uses: <name>.webp (full width, max 2400px) and <name>-720.webp (phones).
# Requires ffmpeg on PATH.  Run from the project folder:
#   bash tools/optimize-images.sh
set -e
cd "$(dirname "$0")/../assets/images"
for f in originals/*.jpg originals/*.jpeg originals/*.png; do
  [ -e "$f" ] || continue
  name=$(basename "${f%.*}")
  ffmpeg -y -loglevel error -i "$f" -vf "scale='min(2400,iw)':-2:flags=lanczos" -c:v libwebp -quality 80 -compression_level 6 "$name.webp"
  ffmpeg -y -loglevel error -i "$f" -vf "scale=720:-2:flags=lanczos" -c:v libwebp -quality 76 -compression_level 6 "$name-720.webp"
  echo "  $name.webp + $name-720.webp"
done
