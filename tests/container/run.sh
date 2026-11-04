#!/usr/bin/env bash
# Resolve one PatternFly Org revision, then run two fresh builds with local doc-core.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
OUTPUT_DIR="${ROOT_DIR}/tests/container/output"
ORG_REF="${ORG_REF:-latest}"
ORG_REPO="${ORG_REPO:-https://github.com/patternfly/patternfly-org.git}"

if [[ "${ORG_REF}" == "latest" ]]; then
  ORG_REF="$(git ls-remote "${ORG_REPO}" HEAD | awk 'NR == 1 { print $1 }')"
  if [[ -z "${ORG_REF}" ]]; then
    echo "Error: Could not resolve PF-Org HEAD for ${ORG_REPO}." >&2
    exit 1
  fi
fi

if command -v podman >/dev/null 2>&1; then
  CONTAINER_ENGINE="podman"
  VOL_FLAG=":Z"
elif command -v docker >/dev/null 2>&1; then
  CONTAINER_ENGINE="docker"
  VOL_FLAG=""
else
  echo "Error: Neither podman nor docker found." >&2
  exit 1
fi

rm -rf "${OUTPUT_DIR}"
mkdir -p "${OUTPUT_DIR}/run1" "${OUTPUT_DIR}/run2"

cd "${ROOT_DIR}"

echo "==> preparing org apiIndex audit image (${CONTAINER_ENGINE}, ORG_REF=${ORG_REF})"
${CONTAINER_ENGINE} build \
  --build-arg ORG_REF="${ORG_REF}" \
  --build-arg ORG_REPO="${ORG_REPO}" \
  -f tests/container/Containerfile \
  -t pf-doc-core-audit:latest \
  .

for run_id in run1 run2; do
  echo "==> org apiIndex build ${run_id} (${CONTAINER_ENGINE})"
  ${CONTAINER_ENGINE} run --rm \
    -v "${OUTPUT_DIR}/${run_id}:/output${VOL_FLAG}" \
    pf-doc-core-audit:latest
done

echo "==> Artifacts under ${OUTPUT_DIR}"
