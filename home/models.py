from django.db import models
from wagtail.models import Page
from wagtail.fields import RichTextField
from wagtail.admin.panels import FieldPanel

class HomePage(Page):
    template = "home_page.html"

    # For "The Senior Addendum"
    hero_text = models.CharField(
        max_length=255, 
        verbose_name="Site Title",
        default="The Senior Addendum"
    )
    
    # For the full manifesto text
    body = RichTextField(blank=True, verbose_name="Manifesto Content")

    content_panels = Page.content_panels + [
        FieldPanel('hero_text'),
        FieldPanel('body'),
    ]