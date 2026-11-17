import os
import time
import subprocess
import json
from PIL import Image

def main():
    os.makedirs('screenshots', exist_ok=True)
    
    # Start serve.ts
    server = subprocess.Popen(['node', 'serve.ts'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(1.5)
    
    with open('shots.json', 'r') as f:
        shots = json.load(f)
        
    chrome_bin = '/home/hatch/workspace/makefun/cft-chrome/chrome-linux64/chrome'
    
    for shot in shots:
        name = shot['name']
        query = shot['query']
        url = f"http://localhost:8080/{query}"
        png_path = 'screenshot.png'
        
        cmd = [
            chrome_bin,
            '--headless=new',
            '--no-sandbox',
            '--disable-gpu',
            '--window-size=1280,720',
            f'--screenshot={png_path}',
            url
        ]
        
        print(f"Taking shot {name} for {url}...")
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        time.sleep(1.5) # Wait for render
        
        if os.path.exists(png_path):
            img = Image.open(png_path)
            if img.size != (1280, 720):
                img = img.resize((1280, 720), Image.Resampling.LANCZOS)
            jpg_path = os.path.join('screenshots', name)
            img.convert('RGB').save(jpg_path, 'JPEG', quality=85)
            os.remove(png_path)
            size_kb = os.path.getsize(jpg_path) / 1024
            print(f"Saved {jpg_path} ({size_kb:.1f} KiB)")
        else:
            print(f"Error taking shot {name}: {res.stderr.decode()}")
            
    server.terminate()
    server.wait()

if __name__ == '__main__':
    main()
