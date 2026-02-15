/* 
 * FILE PURPOSE: Toast Notification System
 * Displays temporary pop-up messages for game events and errors.
 * Messages auto-dismiss after 3 seconds with fade animation.
 */

/* FILE: studio/static/studio/js/scrabble/scrabble_toast.js */
/* DATE: 2026-02-14 06:00 PM */
/* SYNC: Initial toast notification system for game feedback */

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', 'info', 'warning'
 * @param {number} duration - How long to show (milliseconds), default 3000
 */
window.showToast = function(message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icon based on type
    const icons = {
        success: '✓',
        error: '⚠️',
        info: 'ℹ️',
        warning: '⚡'
    };
    
    // Color based on type
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        info: '#2196F3',
        warning: '#FF9800'
    };
    
    toast.innerHTML = `
        <span style="font-size: 20px; margin-right: 10px;">${icons[type]}</span>
        <span>${message}</span>
    `;
    
    toast.style.cssText = `
        background: ${colors[type]};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        font-family: 'Open Sans', sans-serif;
        font-size: 14px;
        min-width: 250px;
        max-width: 500px;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
        pointer-events: auto;
    `;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto-remove after duration
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
};