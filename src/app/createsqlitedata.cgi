#!/usr/bin/python

import os
import json
import sys

from pathlib import Path
path_root = Path(__file__).parents[1]
sys.path.append(str(path_root)+'/libs')

import sqlite3
print("Content-Type: application/json\n")  # JSON is following, with an extra newline for headers end

f = os.popen('/usr/syno/synoman/webman/modules/authenticate.cgi', 'r')
user = f.read().strip()
response = {}
response['success'] = False

if len(user) > 0:
    try:
        con = sqlite3.connect('/usr/syno/etc/esynoscheduler/esynoscheduler.db')
        cur = con.cursor()
        # Create table
        cur.execute('''CREATE TABLE magazines
                    (identifier text, title text, description text)''')
        # Insert data
        cur.execute("INSERT INTO magazines VALUES ('1','Wired','Geek magazine')")
        cur.execute("INSERT INTO magazines VALUES ('2','Elle','Mode magazine')")
        cur.execute("INSERT INTO magazines VALUES ('3','Green','Eco magazine')")
        # Save the changes
        con.commit()
        response['success'] = True
    except:
        response["error"] ="error"
else:
    response["status"] = "not authenticated"
# Print the JSON response
print(json.dumps(response))