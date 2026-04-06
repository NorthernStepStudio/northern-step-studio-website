import re

def clean_rtf_to_html(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Find the start and end of the HTML content
    start_tag = "<!DOCTYPE html>"
    end_tag = "</html>"
    
    # RTF uses \par for newlines, and sometimes tags like \f0, \fs22, etc.
    # We want to keep everything between the start and end tags, but strip RTF controls.
    
    start_idx = content.find(start_tag)
    end_idx = content.find(end_tag)
    
    if start_idx == -1 or end_idx == -1:
        print("Could not find HTML tags in the file.")
        return

    # Extract the block
    html_block = content[start_idx : end_idx + len(end_tag)]
    
    # Strip \par and replace with real newline
    html_block = html_block.replace("\\par\n", "\n").replace("\\par", "\n")
    
    # Strip some common RTF font/style tags that might be inside lines
    # e.g., \f0, \f1, \fs22, \lang9, \{, \}
    # Be careful with \{ and \} as they are used in JS/CSS. 
    # In RTF, literal { is \{ and literal } is \}.
    
    # Replace \{ with { and \} with }
    html_block = html_block.replace("\\{", "{").replace("\\}", "}")
    
    # Strip other \tags (like \f0, \fs22, etc.)
    # These often look like \fN, \fsN, \langN, \uN?
    html_block = re.sub(r'\\[a-z0-9]+ ?', '', html_block)
    
    # Sometimes there are stray backslashes before characters
    # html_block = re.sub(r'\\(?![\n\r])', '', html_block)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_block)
    print(f"Cleaned code written to {output_path}")

if __name__ == "__main__":
    clean_rtf_to_html('game code.rtf', 'game_code_clean.html')
