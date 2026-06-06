#!/usr/bin/env python3
import re
import sys

def convert_markdown_to_gallery(markdown_file, output_file, filename):
    """Convert markdown file with image links to HTML gallery"""
    
    # Read markdown
    with open(markdown_file, 'r') as f:
        content = f.read()
    
    # Extract images: ![alt](url)
    image_regex = r'!\[([^\]]*)\]\(([^)]+)\)'
    matches = re.findall(image_regex, content)
    
    # Generate HTML
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{filename.replace('-', ' ').title()}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f5f5f5;
            padding: 2rem 1rem;
        }}
        
        .container {{
            max-width: 1400px;
            margin: 0 auto;
        }}
        
        h1 {{
            text-align: center;
            margin-bottom: 3rem;
            font-size: 2.5rem;
            color: #333;
            text-transform: capitalize;
        }}
        
        .gallery {{
            column-count: auto;
            column-width: 250px;
            gap: 1.5rem;
            column-gap: 1.5rem;
        }}
        
        .gallery-item {{
            break-inside: avoid;
            margin-bottom: 1.5rem;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            border-radius: 8px;
            transition: transform 0.3s ease;
        }}
        
        .gallery-item:hover {{
            transform: scale(1.02);
        }}
        
        .gallery-item img {{
            width: 100%;
            height: auto;
            display: block;
            border-radius: 8px;
            transition: filter 0.3s ease;
        }}
        
        .gallery-item:hover img {{
            filter: brightness(0.9);
        }}
        
        /* Lightbox */
        .lightbox {{
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 999;
            padding: 2rem;
            overflow: auto;
        }}
        
        .lightbox.active {{
            display: flex;
            align-items: center;
            justify-content: center;
        }}
        
        .lightbox-content {{
            position: relative;
            max-width: 90vw;
            max-height: 90vh;
        }}
        
        .lightbox img {{
            max-width: 100%;
            max-height: 100%;
            border-radius: 4px;
        }}
        
        .lightbox-close {{
            position: absolute;
            top: -2.5rem;
            right: 0;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            background: none;
            border: none;
        }}
        
        .lightbox-close:hover {{
            color: #ccc;
        }}
        
        .lightbox-alt {{
            color: #999;
            margin-top: 1rem;
            text-align: center;
            font-size: 0.9rem;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>{filename.replace('-', ' ')}</h1>
        <div class="gallery" id="gallery">
"""
    
    # Add images
    for alt, url in matches:
        html += f'''            <div class="gallery-item" onclick="openLightbox('{url}', '{alt}')">
                <img src="{url}" alt="{alt}" loading="lazy">
            </div>
'''
    
    html += """        </div>
    </div>
    
    <div class="lightbox" id="lightbox" onclick="closeLightbox(event)">
        <div class="lightbox-content">
            <button class="lightbox-close" onclick="closeLightbox()">×</button>
            <img id="lightbox-img" src="" alt="">
            <div class="lightbox-alt" id="lightbox-alt"></div>
        </div>
    </div>
    
    <script>
        function openLightbox(url, alt) {
            document.getElementById('lightbox-img').src = url;
            document.getElementById('lightbox-alt').textContent = alt || '';
            document.getElementById('lightbox').classList.add('active');
        }
        
        function closeLightbox(event) {
            if (event && event.target.id !== 'lightbox') return;
            document.getElementById('lightbox').classList.remove('active');
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });
    </script>
</body>
</html>
"""
    
    # Write output
    with open(output_file, 'w') as f:
        f.write(html)
    
    print(f"Generated: {output_file} ({len(matches)} images)")

if __name__ == '__main__':
    if len(sys.argv) != 4:
        print("Usage: convert.py <markdown_file> <output_file> <filename>")
        sys.exit(1)
    
    convert_markdown_to_gallery(sys.argv[1], sys.argv[2], sys.argv[3])
