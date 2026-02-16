/* 
 * FILE PURPOSE: Game Initialization & Orchestration
 * Initializes Konva stage, layer, coordinates all game systems, and manages game state.
 * Now uses GameManager for player/turn management.
 */

/* FILE: studio/static/studio/js/scrabble/scrabble_engine.js */
/* DATE: 2026-02-15 11:30 AM */
/* SYNC: Integrated with GameManager - removed local gameState */

let stage, layer;

/**
 * Draw a tile from the bag (now uses GameManager's tile bag)
 * @returns {string|null} - Letter or null if bag empty
 */
window.drawTileFromBag = function() {
    if (!window.GameManager || !window.GameManager.tileBag) {
        console.error('GameManager or tileBag not initialized!');
        return null;
    }
    
    if (window.GameManager.tileBag.length === 0) return null;
    return window.GameManager.tileBag.pop();
};

/**
 * Refill player's rack to 7 tiles
 */
window.refillRack = function() {
    console.log('🔧 === REFILL RACK FUNCTION CALLED ===');
    
    const scale = CONFIG.IS_MOBILE ? CONFIG.STAGE_WIDTH / 800 : 1;
    const rackY = CONFIG.IS_MOBILE ? (CONFIG.STAGE_HEIGHT - 50 * scale) : (707 * scale);
    const startX = 215 * scale;
    const tileSpacing = 42 * scale;
    
    console.log(`🔧 Rack position: x=${startX}, y=${rackY}, spacing=${tileSpacing}`);
    
    // Collect all tiles currently in rack
    let tilesInRack = [];
    layer.find('.tile-group').forEach(tile => {
        if (tile.status === 'in-rack') {
            tilesInRack.push(tile);
            console.log(`🔧 Found tile in rack: ${tile.findOne('Text').text()}`);
        }
    });
    
    console.log(`🔧 Tiles in rack: ${tilesInRack.length}, need: ${7 - tilesInRack.length}`);
    
    // Draw new tiles from bag
    const needed = 7 - tilesInRack.length;
    console.log(`🔧 === DRAWING ${needed} NEW TILES ===`);
    
    for (let i = 0; i < needed; i++) {
        console.log(`🔧 Drawing tile ${i}...`);
        
        const letter = window.drawTileFromBag();
        if (!letter) {
            console.log('🔧 ❌ Tile bag is empty!');
            break;
        }
        
        console.log(`🔧 ✓ Drew letter: "${letter}"`);
        
        const points = CONFIG.TILE_VALUES[letter] || 0;
        
        // Create tile at temporary position (we'll reposition all tiles after)
        let t = createTile(layer, 0, 0, letter, points);
        t.status = 'in-rack';
        
        t.on('click tap', (e) => {
            e.cancelBubble = true;
            if (typeof selectTile === 'function') {
                selectTile(t);
            }
            layer.batchDraw();
        });
        
        tilesInRack.push(t);
        console.log(`🔧 ✓ Created tile: ${letter} (${points} pts)`);
    }
    
    console.log(`🔧 === REPOSITIONING ALL ${tilesInRack.length} TILES ===`);
    
    // Now reposition ALL tiles in rack (old + new) from left to right
    tilesInRack.forEach((tile, index) => {
        const xPos = startX + (index * tileSpacing);
        console.log(`🔧 Positioning tile ${index} (${tile.findOne('Text').text()}) at x=${xPos}`);
        
        tile.position({ x: xPos, y: rackY });
        
        // Animate new tiles only (ones that were just created)
        if (index >= tilesInRack.length - needed) {
            animateNewTile(tile, rackY, (index - (tilesInRack.length - needed)) * 0.1);
        }
    });
    
    console.log(`🔧 === REFILL COMPLETE ===`);
    
    layer.batchDraw();
};

function initStudio() {
    // Initialize tile bag in GameManager
    if (window.GameManager) {
        const distribution = {
            'A': 9, 'B': 2, 'C': 2, 'D': 4, 'E': 12,
            'F': 2, 'G': 3, 'H': 2, 'I': 9, 'J': 1,
            'K': 1, 'L': 4, 'M': 2, 'N': 6, 'O': 8,
            'P': 2, 'Q': 1, 'R': 6, 'S': 4, 'T': 6,
            'U': 4, 'V': 2, 'W': 2, 'X': 1, 'Y': 2,
            'Z': 1, ' ': 2 // Blank tiles
        };
        
        window.GameManager.tileBag = [];
        for (let letter in distribution) {
            for (let i = 0; i < distribution[letter]; i++) {
                window.GameManager.tileBag.push(letter);
            }
        }
        
        // Shuffle the bag
        for (let i = window.GameManager.tileBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [window.GameManager.tileBag[i], window.GameManager.tileBag[j]] = 
                [window.GameManager.tileBag[j], window.GameManager.tileBag[i]];
        }
        
        console.log('Tile bag initialized:', window.GameManager.tileBag.length, 'tiles');
    }
    
    // Responsive dimensions
    const scale = CONFIG.IS_MOBILE ? CONFIG.STAGE_WIDTH / 800 : 1;
    
    stage = new Konva.Stage({ 
        container: 'konva-holder', 
        width: CONFIG.STAGE_WIDTH, 
        height: CONFIG.STAGE_HEIGHT 
    });
    
    layer = new Konva.Layer();
    stage.add(layer);

    // Initialize GameManager with layer
    if (window.GameManager) {
        window.GameManager.init(layer);
    }

    // Paint board with current turn
    const currentTurn = window.GameManager ? window.GameManager.currentTurn : 1;
    paintBoard(layer, 1, currentTurn);
    
    initStackManager(stage, layer);

    // Spawn Rack Tiles on BOTTOM rack (Player - active player)
    const rackY = CONFIG.IS_MOBILE ? (CONFIG.STAGE_HEIGHT - 50 * scale) : (707 * scale);
    const startX = 215 * scale;
    const tileSpacing = 42 * scale;
    
    // Draw 7 tiles from bag
    for (let i = 0; i < 7; i++) {
        const letter = window.drawTileFromBag();
        if (!letter) break;
        
        const points = CONFIG.TILE_VALUES[letter] || 0;
        let t = createTile(layer, startX + (i * tileSpacing), rackY, letter, points);
        
        t.status = 'in-rack';
        
        t.on('click tap', (e) => {
            e.cancelBubble = true;
            if (typeof selectTile === 'function') {
                selectTile(t);
            }
            layer.batchDraw();
        });
    }
    
    // Initial name highlight
    if (window.GameManager) {
        window.GameManager.updateNameHighlights();
    }
    
    layer.draw();
}

document.addEventListener('DOMContentLoaded', initStudio);