from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt  # ← ADD THIS
import json
from pathlib import Path


# This is the function your URLs are looking for:
def studio_sandbox(request):
    return render(request, 'studio/studio_home.html')


# Load word list into memory (happens once when server starts)
SCRABBLE_WORDS = set()
word_file = Path(__file__).parent / 'scrabble_words.txt'

if word_file.exists():
    with open(word_file, 'r') as f:
        SCRABBLE_WORDS = set(line.strip().upper() for line in f)
    print(f"Loaded {len(SCRABBLE_WORDS)} Scrabble words into memory")


@csrf_exempt  # ← ADD THIS LINE
@require_http_methods(["POST"])
def validate_word(request):
    """
    API endpoint to validate if a word is in the Scrabble dictionary
    POST /studio/api/validate-word/
    Body: {"word": "HELLO"}
    Returns: {"valid": true/false, "word": "HELLO"}
    """
    try:
        data = json.loads(request.body)
        word = data.get('word', '').upper().strip()
        
        if not word:
            return JsonResponse({'error': 'No word provided'}, status=400)
        
        is_valid = word in SCRABBLE_WORDS
        
        return JsonResponse({
            'valid': is_valid,
            'word': word
        })
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)