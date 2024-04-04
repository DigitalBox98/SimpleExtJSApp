#!/bin/bash

# Specifies the content type to be JSON
echo "Content-type: application/json"
echo ""
# Initialize JSON structure with the result object
echo "{"
echo "  \"result\": {"
echo "    \"ethernetInterfaces\": ["

USER=$(/usr/syno/synoman/webman/modules/authenticate.cgi)
# Initialize a counter for comma handling
count=0

if [ "${USER}" = "" ]; then
  echo -e "Security : user not authenticated\n"
else
  # Iterate over each Ethernet interface
  for eth in /sys/class/net/eth*; do
    # Only add a comma after the first iteration
    if [ $count -gt 0 ]; then
      echo ","
    fi
    interface=$(basename "$eth")
    address=$(cat "${eth}/address")
    operstate=$(cat "${eth}/operstate")
    speed=$(cat "${eth}/speed" 2>/dev/null || echo "N/A")
    duplex=$(cat "${eth}/duplex" 2>/dev/null || echo "N/A")

    # Output Ethernet interface information within the result object
    echo "      {"
    echo "        \"interface\": \"$interface\","
    echo "        \"address\": \"$address\","
    echo "        \"operstate\": \"$operstate\","
    echo "        \"speed\": \"$speed\","
    echo "        \"duplex\": \"$duplex\""
    echo "      }"
    ((count++))
  done
  # Close the ethernetInterfaces array and result object
  echo ""
  echo "    ]"
  echo "  }"
  echo "}"
fi