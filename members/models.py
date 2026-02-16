from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone


class SubscriptionPlan(models.Model):
    """
    Subscription tiers with pricing and features
    Managed via Django Admin - no code changes needed to adjust prices/features
    """
    TIER_CHOICES = [
        ('free', 'Free'),
        ('member', 'Member'),
        ('premium', 'Premium'),
    ]
    
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, unique=True)
    name = models.CharField(max_length=100)  # e.g., "Addendum Member"
    price_monthly = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    price_yearly = models.DecimalField(max_digits=6, decimal_places=2, default=0.00, null=True, blank=True)
    
    # Feature flags
    can_play_ai_opponents = models.BooleanField(default=False)
    can_play_claude_ai = models.BooleanField(default=False)
    games_per_day_limit = models.IntegerField(default=5, help_text="0 = unlimited")
    show_ads = models.BooleanField(default=True)
    monthly_poem_tokens = models.IntegerField(default=0, help_text="0 = unlimited")
    
    # Display
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_order']
        verbose_name = 'Subscription Plan'
        verbose_name_plural = 'Subscription Plans'
    
    def __str__(self):
        return f"{self.name} (${self.price_monthly}/mo)"


class PlayerProfile(models.Model):
    """
    Extended user profile for tracking experience, subscriptions, and game preferences
    Auto-created when user signs up
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='player_profile')
    
    # Subscription & Access
    subscription_tier = models.CharField(
        max_length=20, 
        choices=SubscriptionPlan.TIER_CHOICES, 
        default='free'
    )
    is_member = models.BooleanField(
        default=False, 
        help_text="True if user has any paid subscription"
    )
    subscription_plan = models.ForeignKey(
        SubscriptionPlan, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='subscribers'
    )
    subscription_started = models.DateTimeField(null=True, blank=True)
    subscription_expires = models.DateTimeField(null=True, blank=True)
    
    # Experience & Leveling
    experience_points = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    
    # Token Balances (for poems, AI games, etc.)
    poem_tokens_remaining = models.IntegerField(default=0)
    games_played_today = models.IntegerField(default=0)
    last_game_reset = models.DateField(default=timezone.now)
    
    # Tutorial/Feature Discovery Flags (Scrabble)
    scrabble_seen_blank_tooltip = models.BooleanField(default=False)
    scrabble_seen_challenge_tutorial = models.BooleanField(default=False)
    scrabble_seen_exchange_tutorial = models.BooleanField(default=False)
    
    # Game Statistics (can expand per game)
    total_games_played = models.IntegerField(default=0)
    total_games_won = models.IntegerField(default=0)
    
    # Admin Notes
    admin_notes = models.TextField(blank=True, help_text="Internal notes for support/billing")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Player Profile'
        verbose_name_plural = 'Player Profiles'
    
    def __str__(self):
        return f"{self.user.username} - {self.get_subscription_tier_display()}"
    
    def add_experience(self, points):
        """Add XP and check for level up"""
        self.experience_points += points
        
        # Simple leveling: 100 XP per level
        new_level = (self.experience_points // 100) + 1
        if new_level > self.level:
            self.level = new_level
            # Could trigger notification here
        
        self.save()
    
    def can_play_today(self):
        """Check if user has games remaining today"""
        # Reset daily counter if needed
        today = timezone.now().date()
        if self.last_game_reset < today:
            self.games_played_today = 0
            self.last_game_reset = today
            self.save()
        
        if not self.subscription_plan:
            return self.games_played_today < 5  # Free tier default
        
        limit = self.subscription_plan.games_per_day_limit
        if limit == 0:  # Unlimited
            return True
        
        return self.games_played_today < limit
    
    def record_game_played(self, won=False):
        """Increment game counters"""
        self.games_played_today += 1
        self.total_games_played += 1
        if won:
            self.total_games_won += 1
        self.save()


class PromoCode(models.Model):
    """
    Promotional codes for discounts or free trials
    """
    code = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=200)
    
    # Discount
    discount_percent = models.IntegerField(default=0, help_text="Percentage off (0-100)")
    discount_amount = models.DecimalField(max_digits=6, decimal_places=2, default=0.00, help_text="Fixed dollar amount off")
    
    # Free trial
    grants_free_days = models.IntegerField(default=0, help_text="Days of free access")
    grants_tier = models.CharField(
        max_length=20, 
        choices=SubscriptionPlan.TIER_CHOICES,
        null=True,
        blank=True,
        help_text="Tier to grant during free trial"
    )
    
    # Usage tracking
    max_uses = models.IntegerField(default=0, help_text="0 = unlimited")
    times_used = models.IntegerField(default=0)
    
    # Validity
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Promo Code'
        verbose_name_plural = 'Promo Codes'
    
    def __str__(self):
        return f"{self.code} - {self.description}"
    
    def is_valid(self):
        """Check if promo code can still be used"""
        if not self.is_active:
            return False
        
        # Check usage limit
        if self.max_uses > 0 and self.times_used >= self.max_uses:
            return False
        
        # Check date validity
        now = timezone.now()
        if now < self.valid_from:
            return False
        if self.valid_until and now > self.valid_until:
            return False
        
        return True


# Signal to auto-create PlayerProfile when User is created
@receiver(post_save, sender=User)
def create_player_profile(sender, instance, created, **kwargs):
    if created:
        PlayerProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_player_profile(sender, instance, **kwargs):
    instance.player_profile.save()