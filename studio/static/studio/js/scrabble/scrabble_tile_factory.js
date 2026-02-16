/* 
 * FILE PURPOSE: Tile Creation Factory
 * Creates draggable Scrabble tiles with letters and point values.
 * Handles blank tiles with animated ? and tooltip.
 */

/* FILE: studio/static/studio/js/scrabble/scrabble_tile_factory.js */
/* DATE: 2026-02-15 02:30 PM */
/* SYNC: Added blank tile support with pulsing ? and tooltip */

function createTile(layer, x, y, letter, points) {
    const scale = CONFIG.IS_MOBILE ? CONFIG.STAGE_WIDTH / 800 : 1;
    const isBlank = (letter === ' ' || letter === '');
    
    const group = new Konva.Group({
        x: x,
        y: y,
        draggable: false,
        name: 'tile-group'
    });

    const tileRect = new Konva.Rect({
        width: 38 * scale,
        height: 38 * scale,
        fill: '#f3e5ab',
        stroke: '#d4a017',
        strokeWidth: 2,
        cornerRadius: 3,
        shadowColor: 'black',
        shadowBlur: 4,
        shadowOffset: { x: 2, y: 2 },
        shadowOpacity: 0.3
    });

    const letterText = new Konva.Text({
        text: isBlank ? '?' : letter,
        fontSize: isBlank ? 28 * scale : 24 * scale,
        fontFamily: 'Arial Black',
        fill: isBlank ? '#FF6600' : 'black',
        width: 38 * scale,
        height: 38 * scale,
        align: 'center',
        verticalAlign: 'middle',
        offsetY: 3 * scale
    });

    const pointText = new Konva.Text({
        text: points.toString(),
        fontSize: 10 * scale,
        fontFamily: 'Arial',
        fill: 'black',
        x: 26 * scale,
        y: 24 * scale
    });

    group.add(tileRect);
    group.add(letterText);
    group.add(pointText);
    
    // Add pulsing animation for blank tiles
    if (isBlank) {
        const pulseAnim = new Konva.Tween({
            node: letterText,
            duration: 0.8,
            scaleX: 1.2,
            scaleY: 1.2,
            opacity: 0.7,
            yoyo: true,
            repeat: -1, // Infinite loop
            easing: Konva.Easings.EaseInOut
        });
        pulseAnim.play();
        
        // Add tooltip click handler
        group.on('click tap', (e) => {
            e.cancelBubble = true;
            showBlankTooltip(layer, group.x(), group.y());
        });
        
        // Visual feedback on hover
        group.on('mouseenter', () => {
            tileRect.stroke('#FF6600');
            tileRect.strokeWidth(3);
            layer.batchDraw();
        });
        
        group.on('mouseleave', () => {
            tileRect.stroke('#d4a017');
            tileRect.strokeWidth(2);
            layer.batchDraw();
        });
    }

    layer.add(group);
    return group;
}

/**
 * Show tooltip explaining blank tiles
 */
function showBlankTooltip(layer, tileX, tileY) {
    const scale = CONFIG.IS_MOBILE ? CONFIG.STAGE_WIDTH / 800 : 1;
    
    // Create tooltip group
    const tooltip = new Konva.Group({
        x: tileX + 50 * scale,
        y: tileY - 80 * scale,
        name: 'blank-tooltip'
    });
    
    // Tooltip background
    const tooltipBg = new Konva.Rect({
        width: 280 * scale,
        height: 90 * scale,
        fill: '#2c3e50',
        stroke: '#FF6600',
        strokeWidth: 3,
        cornerRadius: 8,
        shadowColor: 'black',
        shadowBlur: 10,
        shadowOpacity: 0.6
    });
    
    // Tooltip title
    const tooltipTitle = new Konva.Text({
        text: '⭐ BLANK TILE ⭐',
        fontSize: 16 * scale,
        fontFamily: 'Arial Black',
        fill: '#FF6600',
        width: 280 * scale,
        padding: 10 * scale,
        align: 'center'
    });
    
    // Tooltip description
    const tooltipText = new Konva.Text({
        text: 'Can be used as ANY letter!\nWorth 0 points but very valuable\nfor making high-scoring words.',
        fontSize: 12 * scale,
        fontFamily: 'Arial',
        fill: 'white',
        width: 280 * scale,
        padding: 10 * scale,
        align: 'center',
        y: 28 * scale,
        lineHeight: 1.4
    });
    
    // Close instruction
    const closeText = new Konva.Text({
        text: '(Click anywhere to close)',
        fontSize: 10 * scale,
        fontFamily: 'Arial',
        fill: '#95a5a6',
        width: 280 * scale,
        align: 'center',
        y: 72 * scale
    });
    
    tooltip.add(tooltipBg);
    tooltip.add(tooltipTitle);
    tooltip.add(tooltipText);
    tooltip.add(closeText);
    
    // Fade in animation
    tooltip.opacity(0);
    tooltip.to({
        opacity: 1,
        duration: 0.3,
        easing: Konva.Easings.EaseOut
    });
    
    layer.add(tooltip);
    tooltip.moveToTop();
    layer.batchDraw();
    
    // Click anywhere to close
    const closeTooltip = () => {
        tooltip.to({
            opacity: 0,
            duration: 0.2,
            onFinish: () => {
                tooltip.destroy();
                layer.batchDraw();
                layer.off('click tap', closeTooltip);
            }
        });
    };
    
    // Delay to prevent immediate close from same click
    setTimeout(() => {
        layer.on('click tap', closeTooltip);
    }, 100);
}

function animateNewTile(tile, finalY, delay = 0) {
    const startY = finalY + 100;
    tile.y(startY);
    tile.opacity(0);

    setTimeout(() => {
        tile.to({
            y: finalY,
            opacity: 1,
            duration: 0.4,
            easing: Konva.Easings.BackEaseOut
        });
    }, delay * 1000);
}