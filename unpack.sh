#!/usr/bin/env bash
set -euo pipefail

# /web-design (Daniels-web-design) Unpack & Installation Script for Cursor AI
# Unpacks the web-design skill system into Cursor's user-scoped global skill storage
# (~/.cursor/skills/) without requiring root or any password.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTENTS_DIR="${SCRIPT_DIR}/contents"
PREVIEW_FILE="${SCRIPT_DIR}/preview.html"

CURSOR_SKILLS_DIR="${CURSOR_SKILLS_DIR:-${HOME}/.cursor/skills}"
PRIMARY_TARGET_DIR="${CURSOR_SKILLS_DIR}/web-design"
ALIAS_TARGET_DIR="${CURSOR_SKILLS_DIR}/Daniels-web-design"

echo "===================================================="
echo "  Installing /web-design skill into Cursor AI"
echo "===================================================="

if [ ! -d "${CONTENTS_DIR}" ]; then
  echo "Error: 'contents/' directory not found at ${CONTENTS_DIR}" >&2
  exit 1
fi

mkdir -p "${CURSOR_SKILLS_DIR}"

install_skill_to() {
  local dest="$1"
  if [ -d "${dest}" ] || [ -L "${dest}" ]; then
    echo "--> Removing existing skill installation at ${dest}..."
    rm -rf "${dest}"
  fi

  echo "--> Unpacking skill contents into ${dest}..."
  mkdir -p "${dest}"

  # Copy contents while excluding heavy local build caches (node_modules, .next, screenshots)
  (
    cd "${CONTENTS_DIR}"
    tar -cf - \
      --exclude='./05-golden-examples/app/node_modules' \
      --exclude='./05-golden-examples/app/.next' \
      --exclude='./05-golden-examples/app/screenshots' \
      .
  ) | (
    cd "${dest}"
    tar -xf -
  )

  # Ensure top-level skill metadata and preview.html are always present at the skill root
  for top_file in SKILL.md README.md references.md preview.html; do
    if [ -f "${SCRIPT_DIR}/${top_file}" ]; then
      cp "${SCRIPT_DIR}/${top_file}" "${dest}/${top_file}"
    fi
  done
}

install_skill_to "${PRIMARY_TARGET_DIR}"
install_skill_to "${ALIAS_TARGET_DIR}"

if [ ! -f "${PRIMARY_TARGET_DIR}/SKILL.md" ]; then
  echo "Error: SKILL.md missing in ${PRIMARY_TARGET_DIR}" >&2
  exit 1
fi

echo ""
echo "Successfully installed /web-design skill to:"
echo "  - ${PRIMARY_TARGET_DIR}"
echo "  - ${ALIAS_TARGET_DIR}"
echo ""
echo "Installed skill structure (${PRIMARY_TARGET_DIR}):"
ls -la "${PRIMARY_TARGET_DIR}"
echo ""
echo "Done! Cursor can now load and use /web-design on this machine (no password required)."
echo "===================================================="
