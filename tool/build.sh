#!/usr/bin/env bash
# Minifies the site's CSS and JavaScript for serving.
#
# The readable sources are css/main.css and scripts/main.js. The pages load
# the minified css/main.min.css and scripts/main.min.js. After editing a
# source file, run this to regenerate the minified copy:
#
#   tool/build.sh
#
# Needs terser and clean-css-cli (npm install -g terser clean-css-cli).
set -euo pipefail
cd "$(dirname "$0")/.."

banner_js="/*! © 2026 Mogamat Muneer Miller — all rights reserved. Source-available for viewing only; reuse without permission prohibited. */"
banner_css="$banner_js"

terser scripts/main.js --compress --mangle --comments false \
  --preamble "$banner_js" -o scripts/main.min.js
cleancss css/main.css -o css/main.min.css
# clean-css drops the banner comment; put ours back on top.
printf '%s\n' "$banner_css" | cat - css/main.min.css > css/main.min.css.tmp
mv css/main.min.css.tmp css/main.min.css

echo "Minified: scripts/main.min.js, css/main.min.css"
