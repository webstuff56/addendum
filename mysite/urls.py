from django.conf import settings
from django.urls import include, path
from django.contrib import admin
from studio import urls as studio_urls

from wagtail.admin import urls as wagtailadmin_urls
from wagtail import urls as wagtail_urls
from wagtail.documents import urls as wagtaildocs_urls

# Import the view from your games app
from games import views as game_views 

# 1. Define the patterns we want to namespace
# This creates a 'bucket' called 'games' for your crossword and lobby
game_patterns = ([
    path('crossword/', game_views.crossword_view, name='crossword'),
    # If your lobby is a standard view, add it here:
    # path('lobby/', game_views.lobby_view, name='lobby'), 
], 'games')

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("admin/", include(wagtailadmin_urls)),
    path("documents/", include(wagtaildocs_urls)),

    # 2. THE NAMESPACED PATH
    # This makes 'games:crossword' work in your templates
    path('games/', include(game_patterns)),
    path('studio/', include(studio_urls)),

    # Wagtail handles everything else
    path("", include(wagtail_urls)),
]

# Standard Wagtail snippet for serving media/static in development
if settings.DEBUG:
    from django.conf.urls.static import static
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns

    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)