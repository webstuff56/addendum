from django.db import models
from wagtail.models import Page
from wagtail.admin.panels import FieldPanel

class GameRoomPage(Page):
    # This is the "Bulletin Board" text for your Clubhouse Status
    intro_text = models.TextField(
        blank=True, 
        help_text="Describe what's happening in the clubhouse today."
    )

    content_panels = Page.content_panels + [
        FieldPanel('intro_text'),
    ]

    # This limits where the page can be created (under the Home Page)
    parent_page_types = ['home.HomePage']
