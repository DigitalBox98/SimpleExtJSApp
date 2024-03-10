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
# Custom Dumper that uses double quotes for strings
class DoubleQuotedDumper(yaml.Dumper):
    def represent_scalar(self, tag, value, style=None):
        if isinstance(value, str):
            style = '"'
        return super(DoubleQuotedDumper, self).represent_scalar(tag, value, style)

response = {}

# Authenticate the user
f = os.popen('/usr/syno/synoman/webman/modules/authenticate.cgi', 'r')
user = f.read().strip()
message =""

if len(user) > 0:
    # Read the request body to get the JSON data
    if os.environ.get("REQUEST_METHOD") == "POST":
        ctype, pdict = cgi.parse_header(os.environ["CONTENT_TYPE"])
        if ctype == 'application/json':
            length = int(os.environ["CONTENT_LENGTH"])
            request_body = sys.stdin.read(length)
            data = json.loads(request_body)

            # Convert JSON data to YAML using the custom dumper
            yaml_data = yaml.dump(data, Dumper=DoubleQuotedDumper, default_flow_style=False, sort_keys=False)

            # Define the file path
            file_path = '/tmp/user-config.yml'
            
            # Write the YAML data to a file
            with open(file_path, 'w') as yaml_file:
                yaml_file.write(yaml_data)

            response['message'] = message
            response['success'] = True
else:
    response["status"] = "not authenticated"

# Print the JSON response
print(json.dumps(response))
