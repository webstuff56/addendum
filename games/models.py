from django.db import models
from wagtail.models import Page
from wagtail.admin.panels import FieldPanel

class GameRoomPage(Page):
    # This is your "Bulletin Board" text
    intro_text = models.TextField(
        blank=True, 
        help_text="Describe what's happening in the clubhouse today."
    )

    template = "games/game_room_page.html"

    # We are going back to the "Standard" Wagtail way to protect your layout
    content_panels = Page.content_panels + [
        FieldPanel('intro_text'),
    ]

    parent_page_types = ['home.HomePage']