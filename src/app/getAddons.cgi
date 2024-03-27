#!/usr/bin/python

import os
import json
import sys
import cgi
from pathlib import Path
path_root = Path(__file__).parents[1]
sys.path.append(str(path_root)+'/libs')

import libs.yaml as yaml
print("Content-type: application/json\n")

arguments = cgi.FieldStorage()
category = arguments.getvalue('category') 
#Function to read user configuration from a YAML file
def read_user_config():
    userConfigPath = "/mnt/p1/user-config.yml"
    try:
        with open(userConfigPath, 'r') as file:
            return yaml.safe_load(file)  # Load and parse the YAML file
    except IOError as e:
        return f"Error reading user-config.yml: {e}"
    except e:
        return "{}"


userConfig = read_user_config()

def read_manifests_in_subdirs(parent_directory):
    manifests = []

    for subdir in next(os.walk(parent_directory))[1]: # Iterates through each subdirectory
        manifest_path = os.path.join(parent_directory, subdir, 'manifest.yml')
        if os.path.exists(manifest_path): # Check if manifest.yml exists in the subdir
            with open(manifest_path, 'r') as file:
                try:
                    manifest = yaml.safe_load(file)
                    manifest['installed'] = subdir in userConfig['addons']
                    # Filter by category if specified
                    if category == "system":
                        # Ensure 'system' key exists and is boolean True
                        if manifest.get('system') is True:
                            manifests.append(manifest)
                    else:
                        manifests.append(manifest)
                    
                except yaml.YAMLError as exc:
                    print(f"Error reading {manifest_path}: {exc}")

    return manifests


# Authenticate the user
f = os.popen('/usr/syno/synoman/webman/modules/authenticate.cgi', 'r')
user = f.read().strip()
ADDONS_PATH = '/mnt/p3/addons/'
response = {}

if len(user) > 0:
    addons = read_manifests_in_subdirs(ADDONS_PATH)
    response['result'] = addons
    response['success'] = True
    response['total'] = len(addons)
else:
    response["status"] = "not authenticated"

# Print the JSON response
print(json.dumps(response))
