"""Uploads an image file to a server.

Encodes the image file as base64, constructs a JSON payload with metadata, 
makes an authenticated POST request to the server, and prints the response.

Args:
  file_path: Path to the image file to upload
  token: Authentication token 
  parentId: ID of the parent folder on the server

Returns:
  The JSON response from the server 
"""
import base64
import requests
import sys

file_path = sys.argv[1]
file_name = file_path.split('/')[-1]

file_encoded = None
with open(file_path, "rb") as image_file:
    file_encoded = base64.b64encode(image_file.read()).decode('utf-8')

r_json = { 'name': file_name, 'type': 'image', 'isPublic': True, 'data': file_encoded, 'parentId': sys.argv[3] }
r_headers = { 'X-Token': sys.argv[2] }

r = requests.post("http://0.0.0.0:5000/files", json=r_json, headers=r_headers)
print(r.json())
