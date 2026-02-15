/* 
 * FILE PURPOSE: Tile Creation Factory
 * Creates Scrabble tile objects (visual groups with letter, points, styling)
 * and handles tile spawn animations (pop-up effect from below rack)
 */

/* FILE: studio/static/studio/js/scrabble/scrabble_tile_factory.js */
/* DATE: 2026-02-14 03:45 PM */
/* SYNC: Added responsive tile sizing - scales based on screen width */

function createTile(layer, x, y, letter, points) {
    const scale = CONFIG.IS_MOBILE ? CONFIG.STAGE_WIDTH / 800 : 1;
    const tileSize = 38 * scale;
    
    let group = new Konva.Group({
        x: x,
        y: y,
        draggable: false,
        name: 'tile-group'
    });

    // Tile Base
    group.add(new Konva.Rect({
        width: tileSize,
        height: tileSize,
        fill: '#f3e5ab',
        stroke: '#d4a017',
        strokeWidth: 2,
        cornerRadius: 4,
        shadowBlur: 2
    }));

    // Letter
    group.add(new Konva.Text({
        text: letter,
        fontSize: 22 * scale,
        fontStyle: 'bold',
        width: tileSize,
        padding: 8 * scale,
        align: 'center'
    }));

    // Points
    group.add(new Konva.Text({
        text: points.toString(),
        fontSize: 10 * scale,
        x: 25 * scale,
        y: 25 * scale
    }));

    layer.add(group);
    return group;
}

/**
 * Animate a tile popping up from below the rack
 * @param {Konva.Group} tile - The tile to animate
 * @param {number} finalY - The final Y position
 * @param {number} delay - Delay before animation starts (for staggering)
 */
function animateNewTile(tile, finalY, delay = 0) {
    const scale = CONFIG.IS_MOBILE ? CONFIG.STAGE_WIDTH / 800 : 1;
    // Start 50px below final position (scaled)
    tile.y(finalY + (50 * scale));
    tile.opacity(0);
    
    // Animate up and fade in
    tile.to({
        y: finalY,
        opacity: 1,
        duration: 0.3,
        easing: Konva.Easings.BackEaseOut,
        delay: delay
    });
}