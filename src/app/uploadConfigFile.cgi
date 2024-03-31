#!/usr/bin/python

import os
import json
import sys
import cgi

from http import cookies
from pathlib import Path
path_root = Path(__file__).parents[1]
sys.path.append(str(path_root)+'/libs')

import libs.yaml as yaml
print("Content-type: application/json\n")

response = {}
response['success'] = False
# Authenticate the user
f = os.popen('/usr/syno/synoman/webman/modules/authenticate.cgi', 'r')
user = f.read().strip()
message =""

def read_user_config():
    try:
        with open('/mnt/p1/user-config.yml', 'r') as file:
            return yaml.safe_load(file)  # Load and parse the YAML file
    except IOError as e:
        return f"Error reading user-config.yml: {e}"
    except e:
        return "{}"

if len(user) > 0:
    # Read the request body to get the JSON data
    if os.environ.get("REQUEST_METHOD") == "POST":
        ctype, pdict = cgi.parse_header(os.environ["CONTENT_TYPE"])
        if ctype == 'application/json':
            length = int(os.environ["CONTENT_LENGTH"])
            request_body = sys.stdin.read(length)
            data = json.loads(request_body)

            # Convert JSON data to YAML using the custom dumper
            yaml_data = yaml.dump(data, sort_keys=False)
            try:
                # existing_config = read_user_config()
                # message ='after read existing_config' 
                # Define the file path
                file_path = '/tmp/user-config.yml'
                # existing_config['addons'] = data.addons
                # message ='after remap existing_config' 
                response['addons'] = data
                # Write the YAML data to a file
                with open(file_path, 'w') as yaml_file:
                    yaml_file.write(yaml_data)
                    message ='after write existing_config'

                with open('/tmp/.build', 'w') as build_file:
                    build_file.write('')
                    message ='after write build'

                response['success'] = True
            except Exception as e:
                response["error"] = str(e)

            response['message'] = message
else:
    response["status"] = "not authenticated"

# Print the JSON response
print(json.dumps(response))
