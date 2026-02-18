#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$ROOT_DIR/backups"
TS="$(date +%Y%m%d-%H%M%S)"
ARCHIVE="$BACKUP_DIR/snow-dodge-backup-$TS.tar.gz"

mkdir -p "$BACKUP_DIR"

# Exclude VCS metadata and local backup artifacts
 tar -czf "$ARCHIVE" \
  --exclude='.git' \
  --exclude='backups/*.tar.gz' \
  -C "$ROOT_DIR" .

SHA="$(sha256sum "$ARCHIVE" | awk '{print $1}')"

echo "Backup created: $ARCHIVE"
echo "SHA256: $SHA"
