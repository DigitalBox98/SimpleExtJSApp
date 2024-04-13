#!/usr/bin/env python3
import cgi
import os
import json
import cgitb; cgitb.enable()  # Enable CGI error reporting

print("Content-Type: application/json\n")  # JSON is following, with an extra newline for headers end

# Authenticate the user
f = os.popen('/usr/syno/synoman/webman/modules/authenticate.cgi', 'r')
user = f.read().strip()

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

response = {}
response['success'] = False

if len(user) > 0:
    # Parse query string
    arguments = cgi.FieldStorage()
    rr_manager_config = read_rrmanager_config('/var/packages/rr-manager/target/app/config.txt')
    filename = rr_manager_config.get('RR_UPDATE_PROGRESS_FILE')

    if filename:
        # Construct file path
        file_path = os.path.join('/tmp', filename)

        if os.path.abspath(file_path).startswith('/tmp/'):
            try:
                with open(file_path, 'r') as file:
                    content = file.read()
                    # Attempt to parse the content as JSON
                    parsed_content = json.loads(content)
                    # Success, set the result
                    response["result"] = parsed_content
                    response['success'] = True
            except json.JSONDecodeError:
                response["status"] = "File content is not valid JSON."
            except Exception as e:
                response["status"] = f"Could not read file: {str(e)}"
        else:
            response["status"] = "Invalid file path."
    else:
        response["status"] = "Filename parameter is missing."
else:
    response["status"] = "Authentication failed."

# Print the JSON response at the end
print(json.dumps(response))
