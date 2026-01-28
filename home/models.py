from django.db import models
from wagtail.models import Page
from wagtail.fields import RichTextField
from wagtail.admin.panels import FieldPanel, MultiFieldPanel

class HomePage(Page):
    template = "home_page.html"

    # --- EXISTING FIELDS (DO NOT CHANGE) ---
    hero_text = models.CharField(
        max_length=255, 
        verbose_name="Site Title",
        default="The Senior Addendum"
    )
    body = RichTextField(blank=True, verbose_name="Manifesto Content")

    # --- NEW TILE FIELDS (THE THREE ISLANDS) ---
    
    # 1. Hero Tile
    hero_tile_header = models.CharField(max_length=255, default="The Heroes")
    hero_tile_image = models.ForeignKey(
        'wagtailimages.Image', 
        null=True, blank=True, 
        on_delete=models.SET_NULL, 
        related_name='+'
    )
    hero_tile_text = models.TextField(blank=True, help_text="Small directory text for the Hero tile")

    # 2. Tech Tile
    tech_tile_header = models.CharField(max_length=255, default="The Shield")
    tech_tile_image = models.ForeignKey(
        'wagtailimages.Image', 
        null=True, blank=True, 
        on_delete=models.SET_NULL, 
        related_name='+'
    )
    tech_tile_text = models.TextField(blank=True, help_text="Small directory text for the Tech tile")

    # 3. Health Tile
    health_tile_header = models.CharField(max_length=255, default="Health & Vitality")
    health_tile_image = models.ForeignKey(
        'wagtailimages.Image', 
        null=True, blank=True, 
        on_delete=models.SET_NULL, 
        related_name='+'
    )
    health_tile_text = models.TextField(blank=True, help_text="Small directory text for the Health tile")

    content_panels = Page.content_panels + [
        FieldPanel('hero_text'),
        FieldPanel('body'),
        
        # New Panels for your three Islands
        MultiFieldPanel([
            FieldPanel('hero_tile_header'),
            FieldPanel('hero_tile_image'),
            FieldPanel('hero_tile_text'),
        ], heading="Hero Island Settings"),

        MultiFieldPanel([
            FieldPanel('tech_tile_header'),
            FieldPanel('tech_tile_image'),
            FieldPanel('tech_tile_text'),
        ], heading="Technology Island Settings"),

        MultiFieldPanel([
            FieldPanel('health_tile_header'),
            FieldPanel('health_tile_image'),
            FieldPanel('health_tile_text'),
        ], heading="Health & Vitality Island Settings"),
    ]