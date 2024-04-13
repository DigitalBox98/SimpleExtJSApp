#!/usr/bin/python

import os
import json
import sys

from pathlib import Path
path_root = Path(__file__).parents[1]
sys.path.append(str(path_root)+'/libs')

import libs.yaml as yaml
print("Content-type: application/json\n")

# # Function to read rr_version from a file
def read_rr_version():
    try:
        with open('/mnt/p1/RR_VERSION', 'r') as file:
            return file.read().strip()  # Read and strip newline characters
    except IOError as e:
        return f"Error reading RR_VERSION: {e}"

#Function to read user configuration from a YAML file
def read_user_config():
    try:
        with open('/mnt/p1/user-config.yml', 'r') as file:
            return yaml.safe_load(file)  # Load and parse the YAML file
    except IOError as e:
        return f"Error reading user-config.yml: {e}"
    except e:
        return "{}"
    
def read_rrmanager_config(file_path):
    try:
        config = {}
        with open(file_path, 'r') as file:
            for line in file:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=')
                    config[key.strip()] = value.strip()
        return config
    except IOError as e:
        return f"Error reading user-config.yml: {e}"
    except e:
        return "{}"

# implement check that the file exists and read it to get progress and if exists return status "awaiting_reboot". If not return status "healthy"
def read_rr_awaiting_update(fileName):
    file_path = os.path.join('/tmp', fileName)
    try:
        with open(file_path, 'r') as file:
            return "awaiting_reboot"
    except IOError as e:
        return "healthy"
    except e:
        return "healthy"

    
# Authenticate the user
f = os.popen('/usr/syno/synoman/webman/modules/authenticate.cgi', 'r')
user = f.read().strip()

response = {}

if len(user) > 0:
    response["status"] = "authenticated"
    response["user"] = user

    # Read and add rr_version to the response
    response["rr_version"] = read_rr_version()
    response["user_config"] = read_user_config()
    response["rr_manager_config"] = read_rrmanager_config('/var/packages/rr-manager/target/app/config.txt')
    response["rr_health"] = read_rr_awaiting_update(response["rr_manager_config"].get("RR_UPDATE_PROGRESS_FILE"))
else:
    response["status"] = "not authenticated"

# Print the JSON response
print(json.dumps(response))
