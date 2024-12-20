#!/usr/bin/env python3
import os

def process_text(input_file='temp.txt', output_file='temp.txt'):
    try:
        # Read input file
        with open(input_file, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # Add your text processing logic here
        processed_text = text.upper()  # Example processing
        
        # Write back to the same file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(processed_text)
            
    except Exception as e:
        print(f"Error processing text: {str(e)}")

if __name__ == "__main__":
    process_text()