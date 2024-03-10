#!/usr/bin/env python3
import cgi
import os
import json
import cgitb; cgitb.enable()  # Enable CGI error reporting

print("Content-Type: application/json\n")  # JSON is following, with an extra newline for headers end

# Authenticate the user
f = os.popen('/usr/syno/synoman/webman/modules/authenticate.cgi', 'r')
user = f.read().strip()

response = {}
response['success'] = False

if len(user) > 0:
    # Parse query string
    arguments = cgi.FieldStorage()
    filename = arguments.getvalue('filename')

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
