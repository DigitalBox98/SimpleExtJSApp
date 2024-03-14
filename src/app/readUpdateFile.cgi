#!/usr/bin/python

import os
import json
import sys
from urllib.parse import parse_qs, unquote
import zipfile
from pathlib import Path
path_root = Path(__file__).parents[1]
sys.path.append(str(path_root)+'/libs')

import libs.yaml as yaml
print("Content-type: application/json\n")
response = {}
response['success'] = False
#Function to read user configuration from a YAML file
def read_update_info(fileName):
    try:
        with zipfile.ZipFile(fileName, mode="r") as zif:
            if "RR_VERSION" in zif.namelist():
                for lines in zif.read("RR_VERSION").split(b"\r\n"):
                    response['updateVersion'] = lines.strip().decode('utf-8')
                    response['success'] = True
            else:
                raise Exception("'RR_VERSION' file not found in the zip file.")
    except Exception as e:
        response["error"] = str(e)

# Authenticate the user
f = os.popen('/usr/syno/synoman/webman/modules/authenticate.cgi', 'r')
user = f.read().strip()



if len(user) > 0:
    response["status"] = "authenticated"
    response["user"] = user
    # Extract query string from environment variable
    query_string = os.environ.get('QUERY_STRING', '')
    query_params = parse_qs(query_string)
    file_name_encoded = query_params.get('file', [None])[0]
    file_name = unquote(file_name_encoded)
    # response["file_from_params"] = file_name
    read_update_info(file_name)
else:
    response["status"] = "not authenticated"

# Print the JSON response
print(json.dumps(response))
