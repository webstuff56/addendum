/* FILE: studio/static/studio/js/mobile-menu.js */
/* DATE: 2026-02-14 04:30 PM */
/* SYNC: Handles mobile menu and chat drawer interactions */

document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const menuDrawer = document.getElementById('menu-drawer');
    const closeMenu = document.getElementById('close-menu');
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatContainer = document.getElementById('chat-container');
    const closeChat = document.getElementById('close-chat');
    const drawerOverlay = document.getElementById('drawer-overlay');

    // Hamburger menu
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            menuDrawer.classList.add('open');
            drawerOverlay.classList.add('active');
        });
    }

    if (closeMenu) {
        closeMenu.addEventListener('click', () => {
            menuDrawer.classList.remove('open');
            drawerOverlay.classList.remove('active');
        });
    }

    // Chat drawer
    if (chatToggleBtn) {
        chatToggleBtn.addEventListener('click', () => {
            chatContainer.classList.add('open');
            drawerOverlay.classList.add('active');
            // Reset badge
            document.getElementById('chat-badge').textContent = '0';
        });
    }

    if (closeChat) {
        closeChat.addEventListener('click', () => {
            chatContainer.classList.remove('open');
            drawerOverlay.classList.remove('active');
        });
    }

    // Close drawers when clicking overlay
    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', () => {
            menuDrawer.classList.remove('open');
            chatContainer.classList.remove('open');
            drawerOverlay.classList.remove('active');
        });
    }

    // TODO: Increment chat badge when new message arrives
    // This would connect to your WebSocket chat system
});