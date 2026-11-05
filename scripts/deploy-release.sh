#!/usr/bin/env bash
set -euo pipefail

# Run only on a dedicated, protected internal deployment runner. This script
# installs the built artifact; it does not clone or serve the source repository.
: "${DEPLOY_ROOT:?DEPLOY_ROOT must be set, e.g. /srv/www/portfolio}"
: "${CI_COMMIT_SHA:?CI_COMMIT_SHA is required}"
: "${CI_PIPELINE_ID:?CI_PIPELINE_ID is required}"
[[ "$DEPLOY_ROOT" = /* && "$DEPLOY_ROOT" != / && "$DEPLOY_ROOT" != *'..'* ]] || { echo 'Invalid deployment root' >&2; exit 1; }
[[ "$CI_COMMIT_SHA" =~ ^[a-f0-9]{40,64}$ && "$CI_PIPELINE_ID" =~ ^[0-9]+$ ]] || { echo 'Invalid release identity' >&2; exit 1; }
[[ -f _site/index.html && -f _site/admin/config.yml ]] || { echo 'Missing built artifact' >&2; exit 1; }
[[ ! -e _site/.git && ! -e _site/scripts && ! -e _site/deploy && ! -e _site/.env ]] || { echo 'Source or secret files in artifact' >&2; exit 1; }
if find _site -type l -print -quit | grep -q .; then echo 'Symlinks are not allowed in the artifact' >&2; exit 1; fi

umask 022
mkdir -p "$DEPLOY_ROOT/releases"
release="$DEPLOY_ROOT/releases/${CI_COMMIT_SHA}-${CI_PIPELINE_ID}"
# Reusing an existing release is rejected so deployed releases stay immutable.
mkdir "$release"
cp -R _site/. "$release/"
chmod -R u=rwX,go=rX "$release"
temporary_link="$DEPLOY_ROOT/.current-${CI_PIPELINE_ID}"
ln -s "$release" "$temporary_link"
# Linux rename within one filesystem changes the active release atomically.
mv -Tf "$temporary_link" "$DEPLOY_ROOT/current"
printf 'Deployed release %s\n' "${CI_COMMIT_SHA}-${CI_PIPELINE_ID}"
# Retention and rollback are administrator operations; no releases are deleted.
