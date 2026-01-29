from django.conf import settings
from django.urls import include, path
from django.contrib import admin

from wagtail.admin import urls as wagtailadmin_urls
from wagtail import urls as wagtail_urls
from wagtail.documents import urls as wagtaildocs_urls

# Import the view from your games app
from games import views as game_views 

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("admin/", include(wagtailadmin_urls)),
    path("documents/", include(wagtaildocs_urls)),

    # THE CROSSWORD ENGINE PATH
    # This must stay above the wagtail_urls include
    path('games/crossword/', game_views.crossword_view, name='crossword'),

    # Wagtail handles everything else
    path("", include(wagtail_urls)),
]

# Standard Wagtail snippet for serving media/static in development
if settings.DEBUG:
    from django.conf.urls.static import static
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns

    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)