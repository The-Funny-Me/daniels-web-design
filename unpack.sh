#!/usr/bin/env bash
set -euo pipefail

# Daniels-web-design Unpack & Installation Script for Cursor AI
# Unpacks the web-design skill system into Cursor's default global skill storage.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTENTS_DIR="${SCRIPT_DIR}/contents"
PREVIEW_FILE="${SCRIPT_DIR}/preview.html"

# Cursor default global skill destination
CURSOR_SKILLS_DIR="${HOME}/.cursor/skills"
TARGET_DIR="${CURSOR_SKILLS_DIR}/Daniels-web-design"

echo "===================================================="
echo "  Installing Daniels-web-design into Cursor AI"
echo "===================================================="

if [ ! -d "${CONTENTS_DIR}" ]; then
  echo "Error: 'contents/' directory not found at ${CONTENTS_DIR}"
  exit 1
fi

# Ensure Cursor skills directory exists
mkdir -p "${CURSOR_SKILLS_DIR}"

# Clean previous installation if exists
if [ -d "${TARGET_DIR}" ]; then
  echo "--> Removing existing skill installation at ${TARGET_DIR}..."
  rm -rf "${TARGET_DIR}"
fi

# Copy skill contents to destination
echo "--> Unpacking contents into ${TARGET_DIR}..."
mkdir -p "${TARGET_DIR}"
cp -R "${CONTENTS_DIR}/"* "${TARGET_DIR}/"

# Include preview.html inside target directory for local inspection
if [ -f "${PREVIEW_FILE}" ]; then
  cp "${PREVIEW_FILE}" "${TARGET_DIR}/"
fi

echo ""
echo "Successfully installed Daniels-web-design to:"
echo "  ${TARGET_DIR}"
echo ""
echo "Installation contents:"
ls -la "${TARGET_DIR}"
echo ""
echo "Done! The Cursor agent can now access Daniels-web-design system-wide."
echo "===================================================="
