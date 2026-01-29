from django.shortcuts import render

def crossword_view(request):
    return render(request, 'games/crossword_game.html')