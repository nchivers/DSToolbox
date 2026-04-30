#!/bin/bash
# Safe cleanup for 7-qa-storybook screenshots and UI hierarchies.
# Only deletes files matching strict naming conventions:
#   capture-*.png, hierarchy-*.xml, hierarchy-*.json
#
# Usage: tools/7-qa-storybook/utils/cleanup.sh
# Run from the DSToolbox workspace root.

TMP_DIR="tools/7-qa-storybook/.tmp"

cleanup_dir() {
    local dir="$1"
    local count=0

    [[ ! -d "$dir" ]] && echo "0" && return

    for f in "$dir"/capture-*.png; do
        [[ -f "$f" ]] && rm "$f" && ((count++))
    done

    for f in "$dir"/hierarchy-*.xml "$dir"/hierarchy-*.json; do
        [[ -f "$f" ]] && rm "$f" && ((count++))
    done

    echo "$count"
}

mkdir -p "$TMP_DIR"

deleted=$(cleanup_dir "$TMP_DIR")

echo "Cleanup complete: $deleted files removed"
