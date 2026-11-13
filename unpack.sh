#!/usr/bin/env bash
set -euo pipefail

# Installs the /web-design skill (the contents/ folder) into Cursor's user skill folder.
# No root or password needed. Re-running replaces the previous install.
#   CURSOR_SKILLS_DIR=/custom/path ./unpack.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTENTS_DIR="${SCRIPT_DIR}/contents"
SKILLS_DIR="${CURSOR_SKILLS_DIR:-${HOME}/.cursor/skills}"
TARGET_DIR="${SKILLS_DIR}/web-design"
LEGACY_DIR="${SKILLS_DIR}/Daniels-web-design"

if [ ! -f "${CONTENTS_DIR}/SKILL.md" ]; then
  echo "Error: ${CONTENTS_DIR}/SKILL.md not found" >&2
  exit 1
fi

mkdir -p "${SKILLS_DIR}"

# Older versions installed a second copy under Daniels-web-design; two copies show agents the skill twice.
if [ -d "${LEGACY_DIR}" ] && grep -q '^name: web-design' "${LEGACY_DIR}/SKILL.md" 2>/dev/null; then
  echo "--> Removing legacy duplicate install at ${LEGACY_DIR}"
  rm -rf "${LEGACY_DIR}"
fi

if [ -e "${TARGET_DIR}" ]; then
  echo "--> Replacing existing install at ${TARGET_DIR}"
  rm -rf "${TARGET_DIR}"
fi
mkdir -p "${TARGET_DIR}"

# Copy the skill, skipping local build output and generated app tokens (npm install regenerates them).
(
  cd "${CONTENTS_DIR}"
  tar -cf - \
    --exclude='./05-golden-examples/app/node_modules' \
    --exclude='./05-golden-examples/app/.next' \
    --exclude='./05-golden-examples/app/shots' \
    --exclude='./05-golden-examples/app/screenshots' \
    --exclude='./05-golden-examples/app/src/design' \
    --exclude='./05-golden-examples/app/next-env.d.ts' \
    --exclude='*.tsbuildinfo' \
    .
) | (cd "${TARGET_DIR}" && tar -xf -)

echo "Installed /web-design to ${TARGET_DIR}"
