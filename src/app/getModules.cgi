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
def read_rr_modules_version(parent_directory):
    try:
        with open(parent_directory+'/VERSION', 'r') as file:
            return file.read().strip()  # Read and strip newline characters
    except IOError as e:
        return f"Error reading RR_MODULES_VERSION: {e}"
    
def read_modules(parent_directory):
    modules = []

    for subdir in next(os.walk(parent_directory))[1]: # Iterates through each subdirectory
        manifest_path = os.path.join(parent_directory, subdir, 'manifest.yml')
        if os.path.exists(manifest_path): # Check if manifest.yml exists in the subdir
            with open(manifest_path, 'r') as file:
                try:
                    modules.append(yaml.safe_load(file)) # Load the YAML file
                except yaml.YAMLError as exc:
                    print(f"Error reading {manifest_path}: {exc}")

    return modules


# Authenticate the user
f = os.popen('/usr/syno/synoman/webman/modules/authenticate.cgi', 'r')
user = f.read().strip()

ADDONS_PATH = '/mnt/p3/modules/'
response = {}

if len(user) > 0:
    addons = read_modules(ADDONS_PATH)
    response['version']= read_rr_modules_version(ADDONS_PATH)
    response['result'] = addons
    response['success'] = True
    response['total'] = len(addons)
else:
    response["status"] = "not authenticated"

# Print the JSON response
print(json.dumps(response))
