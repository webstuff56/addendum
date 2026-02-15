/* 
 * FILE PURPOSE: Game Initialization & Orchestration
 * Initializes Konva stage, layer, coordinates all game systems, and manages game state.
 * Tracks current turn, player scores, and tile bag for the entire game.
 */

/* FILE: studio/static/studio/js/scrabble/scrabble_engine.js */
/* DATE: 2026-02-14 08:00 PM */
/* SYNC: Fixed nextTurn to not destroy board - temporary solution until we implement proper turn visual update */

let stage, layer;

// ========== GAME STATE ==========
let gameState = {
    currentTurn: 1, // Index of current player (0-3)
    players: [
        { name: 'Player 1', score: 0 },
        { name: 'Player 2', score: 0 },
        { name: 'Player 3', score: 0 },
        { name: 'Player 4', score: 0 }
    ],
    tileBag: [] // Will be populated with all 100 Scrabble tiles
};

/**
 * Initialize the tile bag with correct Scrabble distribution
 */
function initTileBag() {
    const distribution = {
        'A': 9, 'B': 2, 'C': 2, 'D': 4, 'E': 12,
        'F': 2, 'G': 3, 'H': 2, 'I': 9, 'J': 1,
        'K': 1, 'L': 4, 'M': 2, 'N': 6, 'O': 8,
        'P': 2, 'Q': 1, 'R': 6, 'S': 4, 'T': 6,
        'U': 4, 'V': 2, 'W': 2, 'X': 1, 'Y': 2,
        'Z': 1, ' ': 2 // Blank tiles
    };
    
    gameState.tileBag = [];
    for (let letter in distribution) {
        for (let i = 0; i < distribution[letter]; i++) {
            gameState.tileBag.push(letter);
        }
    }
    
    // Shuffle the bag
    for (let i = gameState.tileBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.tileBag[i], gameState.tileBag[j]] = [gameState.tileBag[j], gameState.tileBag[i]];
    }
}

/**
 * Draw a tile from the bag
 * @returns {string|null} - Letter or null if bag empty
 */
window.drawTileFromBag = function() {
    if (gameState.tileBag.length === 0) return null;
    return gameState.tileBag.pop();
};

/**
 * Update player score
 * @param {number} playerIndex - Player index (0-3)
 * @param {number} points - Points to add
 */
window.updatePlayerScore = function(playerIndex, points) {
    gameState.players[playerIndex].score += points;
    console.log(`Player ${playerIndex + 1} score: ${gameState.players[playerIndex].score} (+${points})`);
};

/**
 * Switch to next player's turn
 */
window.nextTurn = function() {
    gameState.currentTurn = (gameState.currentTurn + 1) % 4;
    console.log(`Now Player ${gameState.currentTurn + 1}'s turn`);
    
    // TODO: Update name box glow without destroying board
    // For now, just switch turn in memory - visual update comes later
};

/**
 * Refill player's rack to 7 tiles
 */
window.refillRack = function() {
    const scale = CONFIG.IS_MOBILE ? CONFIG.STAGE_WIDTH / 800 : 1;
    const rackY = CONFIG.IS_MOBILE ? (CONFIG.STAGE_HEIGHT - 50 * scale) : (707 * scale);
    const startX = 215 * scale;
    const tileSpacing = 42 * scale;
    
    // Count tiles in rack
    let tilesInRack = 0;
    layer.find('.tile-group').forEach(tile => {
        if (tile.status === 'in-rack') {
            tilesInRack++;
        }
    });
    
    console.log(`Tiles in rack: ${tilesInRack}, need: ${7 - tilesInRack}`);
    
    // Draw new tiles
    const needed = 7 - tilesInRack;
    for (let i = 0; i < needed; i++) {
        const letter = window.drawTileFromBag();
        if (!letter) {
            console.log('Tile bag is empty!');
            break;
        }
        
        const points = CONFIG.TILE_VALUES[letter] || 0;
        const xPos = startX + (tilesInRack + i) * tileSpacing;
        
        let t = createTile(layer, xPos, rackY, letter, points);
        t.status = 'in-rack';
        
        t.on('click tap', (e) => {
            e.cancelBubble = true;
            if (typeof selectTile === 'function') {
                selectTile(t);
            }
            layer.batchDraw();
        });
        
        // Animate tile popping up
        animateNewTile(t, rackY, i * 0.1);
    }
    
    layer.batchDraw();
};

function initStudio() {
    // Initialize tile bag
    initTileBag();
    console.log('Tile bag initialized:', gameState.tileBag.length, 'tiles');
    
    // Responsive dimensions
    const scale = CONFIG.IS_MOBILE ? CONFIG.STAGE_WIDTH / 800 : 1;
    
    stage = new Konva.Stage({ 
        container: 'konva-holder', 
        width: CONFIG.STAGE_WIDTH, 
        height: CONFIG.STAGE_HEIGHT 
    });
    
    layer = new Konva.Layer();
    stage.add(layer);

    paintBoard(layer, 1, gameState.currentTurn);
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
    
    layer.draw();
}

document.addEventListener('DOMContentLoaded', initStudio);