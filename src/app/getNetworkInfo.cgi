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
  echo "    ],"

  # Extract and format /proc/cmdline information without the last comma
  echo "    \"bootParameters\": {"
  cmdline=$(cat /proc/cmdline)
  # Splitting cmdline into key-value pairs
  IFS=' ' read -ra ADDR <<< "$cmdline"
  len=${#ADDR[@]}
  for (( i=0; i<$len; i++ )); do
    key=$(echo ${ADDR[$i]} | cut -f1 -d=)
    value=$(echo ${ADDR[$i]} | cut -f2 -d=)
    if [ $i -lt $((len - 1)) ]; then
      echo "      \"$key\": \"$value\","
    else
      echo "      \"$key\": \"$value\""
    fi
  done
  echo "    },"

  echo "    \"syno_mac_addresses\": ["
  file_path="/proc/sys/kernel/syno_mac_addresses"
  declare -a mac_addresses
  while IFS= read -r line; do
    # Append each line (MAC address) to the array
    mac_addresses+=("$line")
  done < "$file_path"

  # Get the length of the array for reference in the loop
  len=${#mac_addresses[@]}
  for (( i=0; i<$len; i++ )); do
    # Check if it's the last element to avoid adding a comma
    if [ $i -eq $((len-1)) ]; then
      echo "    \"${mac_addresses[$i]}\""
    else
      echo "    \"${mac_addresses[$i]}\","
    fi
  done

  echo "    ]"

  echo "  }"
  echo "}"
fi