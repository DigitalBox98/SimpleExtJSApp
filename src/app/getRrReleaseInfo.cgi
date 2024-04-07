#!/usr/bin/env bash
# Assuming jq is installed on your system for parsing and generating JSON
# Content-Type header for JSON output
echo "Content-type: application/json"
echo ""

USER=$(/usr/syno/synoman/webman/modules/authenticate.cgi)

if [ "${USER}" = "" ]; then
  echo -e "Security : user not authenticated\n"
else
  # Define the URL for GitHub API
  URL="https://api.github.com/repos/RROrg/rr/releases/latest"

  # Fetch the latest release info using the GitHub API
  response=$(curl -s "${URL}")

  # Extract the tag name from the response
  TAG=$(echo "${response}" | jq -r '.tag_name')

  # Read local version
  LOCALTAG=$(cat /usr/rr/VERSION 2>/dev/null | grep LOADERVERSION | cut -d'=' -f2)

  # Check if LOCALTAG is empty
  if [ -z "${LOCALTAG}" ]; then
    # Generate error message using jq
    echo "{}" | jq --arg message "Unknown bootloader version!" '.error = $message'
    exit 0
  fi

  # Generate output JSON
  if [ "${TAG}" = "${LOCALTAG}" ]; then
    # Use jq to generate JSON for up-to-date status
    echo "{}" | jq --arg tag "$TAG" --arg message "Actual version is ${TAG}" \
      '.status = "up-to-date" | .tag = $tag | .message = $message'
  else
    # Use jq to generate JSON for update available, including release notes
    # Fetch and escape release notes from GitHub API response
    releaseNotes=$(echo "${response}" | jq '.body')
    
    # Use jq to build the JSON response
    echo "{}" | jq --arg tag "$TAG" --argjson notes "$releaseNotes" \
      '.status = "update available" | .tag = $tag | .notes = $notes'
  fi

fi