#!/bin/bash
# Capture screenshot and UI hierarchy from the connected mobile device for the
# DSToolbox 7-qa-storybook skill. Vendored from the ux mobile--device-interaction
# skill with TMP_DIR repointed to tools/7-qa-storybook/.tmp.
#
# Usage: tools/7-qa-storybook/utils/capture.sh <android|ios>
# Run from the DSToolbox workspace root.

set -e

PLATFORM="$1"
TMP_DIR="tools/7-qa-storybook/.tmp"

if [[ -z "$PLATFORM" ]]; then
    echo "Usage: capture.sh <android|ios>"
    exit 1
fi

if [[ "$PLATFORM" != "android" && "$PLATFORM" != "ios" ]]; then
    echo "Error: Platform must be 'android' or 'ios'"
    exit 1
fi

mkdir -p "$TMP_DIR"

existing=$(ls -1 "$TMP_DIR"/capture-*.png 2>/dev/null | wc -l | tr -d ' ')
next_index=$((existing + 1))
IDX=$(printf "%02d" "$next_index")

TS=$(date +%s)
FILENAME="capture-$IDX-$TS"

if [[ "$PLATFORM" == "android" ]]; then
    DEVICE_SCREEN="/sdcard/$FILENAME.png"
    DEVICE_HIERARCHY="/sdcard/hierarchy-$IDX-$TS.xml"

    adb shell screencap "$DEVICE_SCREEN" && adb pull "$DEVICE_SCREEN" "$TMP_DIR/$FILENAME.png"
    adb shell uiautomator dump "$DEVICE_HIERARCHY" && adb pull "$DEVICE_HIERARCHY" "$TMP_DIR/hierarchy-$IDX-$TS.xml"
    adb shell rm -f "$DEVICE_SCREEN" "$DEVICE_HIERARCHY" 2>/dev/null || true

    sips --resampleHeightWidthMax 1600 "$TMP_DIR/$FILENAME.png" >/dev/null
    echo "Captured: $FILENAME.png, hierarchy-$IDX-$TS.xml"
else
    idb screenshot "$TMP_DIR/$FILENAME.png"
    idb ui describe-all > "$TMP_DIR/hierarchy-$IDX-$TS.json"
    sips --resampleHeightWidthMax 1600 "$TMP_DIR/$FILENAME.png" >/dev/null
    echo "Captured: $FILENAME.png, hierarchy-$IDX-$TS.json"
fi
