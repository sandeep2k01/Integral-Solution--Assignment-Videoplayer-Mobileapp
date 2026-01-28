import json
import os

try:
    # Use binary read to avoid encoding issues
    with open('build_details.json', 'rb') as f:
        content = f.read()
    
    # Try multiple encodings
    for encoding in ['utf-16', 'utf-8', 'utf-16-le']:
        try:
            data = json.loads(content.decode(encoding))
            print("FOUND_URL: " + data.get('artifacts', {}).get('buildUrl', 'NOT_FOUND'))
            break
        except:
            continue
except Exception as e:
    print(f"ERROR: {str(e)}")
