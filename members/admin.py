from django.contrib import admin
from .models import SubscriptionPlan, PlayerProfile, PromoCode


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'tier', 'price_monthly', 'price_yearly', 'is_active', 'display_order']
    list_filter = ['tier', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['display_order']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('tier', 'name', 'description', 'display_order', 'is_active')
        }),
        ('Pricing', {
            'fields': ('price_monthly', 'price_yearly')
        }),
        ('Features', {
            'fields': (
                'can_play_ai_opponents',
                'can_play_claude_ai',
                'games_per_day_limit',
                'show_ads',
                'monthly_poem_tokens'
            )
        }),
    )


@admin.register(PlayerProfile)
class PlayerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'subscription_tier', 'is_member', 'level', 'experience_points', 'total_games_played']
    list_filter = ['subscription_tier', 'is_member', 'level']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at', 'experience_points', 'level']
    
    fieldsets = (
        ('User Info', {
            'fields': ('user',)
        }),
        ('Subscription', {
            'fields': (
                'subscription_tier',
                'is_member',
                'subscription_plan',
                'subscription_started',
                'subscription_expires'
            )
        }),
        ('Progress & Stats', {
            'fields': (
                'experience_points',
                'level',
                'total_games_played',
                'total_games_won'
            )
        }),
        ('Token Balances', {
            'fields': (
                'poem_tokens_remaining',
                'games_played_today',
                'last_game_reset'
            )
        }),
        ('Tutorial Flags', {
            'fields': (
                'scrabble_seen_blank_tooltip',
                'scrabble_seen_challenge_tutorial',
                'scrabble_seen_exchange_tutorial'
            ),
            'classes': ('collapse',)
        }),
        ('Admin', {
            'fields': ('admin_notes', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['upgrade_to_member', 'upgrade_to_premium', 'reset_daily_games']
    
    def upgrade_to_member(self, request, queryset):
        member_plan = SubscriptionPlan.objects.get(tier='member')
        queryset.update(
            subscription_tier='member',
            is_member=True,
            subscription_plan=member_plan
        )
        self.message_user(request, f"{queryset.count()} users upgraded to Member")
    upgrade_to_member.short_description = "Upgrade selected to Member tier"
    
    def upgrade_to_premium(self, request, queryset):
        premium_plan = SubscriptionPlan.objects.get(tier='premium')
        queryset.update(
            subscription_tier='premium',
            is_member=True,
            subscription_plan=premium_plan
        )
        self.message_user(request, f"{queryset.count()} users upgraded to Premium")
    upgrade_to_premium.short_description = "Upgrade selected to Premium tier"
    
    def reset_daily_games(self, request, queryset):
        queryset.update(games_played_today=0)
        self.message_user(request, f"Reset daily games for {queryset.count()} users")
    reset_daily_games.short_description = "Reset daily game counter"


@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ['code', 'description', 'discount_percent', 'times_used', 'max_uses', 'is_active', 'valid_until']
    list_filter = ['is_active', 'grants_tier']
    search_fields = ['code', 'description']
    readonly_fields = ['times_used', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Code Info', {
            'fields': ('code', 'description', 'is_active')
        }),
        ('Discount', {
            'fields': ('discount_percent', 'discount_amount')
        }),
        ('Free Trial', {
            'fields': ('grants_free_days', 'grants_tier')
        }),
        ('Usage & Validity', {
            'fields': (
                'max_uses',
                'times_used',
                'valid_from',
                'valid_until'
            )
        }),
    )
