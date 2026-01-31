from django.shortcuts import render

# This is the function your URLs are looking for:
def studio_sandbox(request):
    return render(request, 'studio/studio_home.html')