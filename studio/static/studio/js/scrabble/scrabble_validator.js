/* 
 * FILE PURPOSE: Word Validation & Scoring
 * Validates tile placement, checks game rules, and calculates scores with multipliers.
 */

/* FILE: studio/static/studio/js/scrabble/scrabble_validator.js */
/* DATE: 2026-02-17 10:30 AM */
/* SYNC: Added resetToFirstMove() function for when board becomes empty after challenge */

// Track if this is the first move of the game
let isFirstMove = true;

/**
 * Reset to first move state (used when challenge clears the board)
 */
window.resetToFirstMove = function() {
    isFirstMove = true;
    console.log('Board reset to first move state');
};

/**
 * Get newly placed tiles (status = 'played-this-turn')
 */
function getNewlyPlacedTiles(layer) {
    const tiles = [];
    layer.find('.tile-group').forEach(tile => {
        if (tile.status === 'played-this-turn') {
            tiles.push(tile);
        }
    });
    return tiles;
}

/**
 * Get tile at specific grid position
 */
function getTileAt(layer, gridX, gridY) {
    let foundTile = null;
    layer.find('.tile-group').forEach(tile => {
        const tileGridPos = pixelToGrid(tile.x(), tile.y());
        if (tileGridPos.gridX === gridX && tileGridPos.gridY === gridY) {
            foundTile = tile;
        }
    });
    return foundTile;
}

/**
 * Convert pixel coordinates to grid coordinates
 */
function pixelToGrid(x, y) {
    const gridX = Math.floor((x - CONFIG.BOARD_X_OFFSET) / CONFIG.GRID_SIZE);
    const gridY = Math.floor((y - CONFIG.BOARD_Y_OFFSET) / CONFIG.GRID_SIZE);
    return { gridX, gridY };
}

/**
 * Check if a coordinate string matches any multiplier
 */
function getMultiplierType(gridX, gridY) {
    const coord = `${gridX},${gridY}`;
    
    if (CONFIG.MULTIPLIERS.TW.includes(coord)) return 'TW';
    if (CONFIG.MULTIPLIERS.DW.includes(coord)) return 'DW';
    if (CONFIG.MULTIPLIERS.TL.includes(coord)) return 'TL';
    if (CONFIG.MULTIPLIERS.DL.includes(coord)) return 'DL';
    
    return null;
}

/**
 * Validate and score the current move
 */
window.validateSubmit = function(layer) {
    const newTiles = getNewlyPlacedTiles(layer);
    
    // Rule 1: Must place at least one tile
    if (newTiles.length === 0) {
        return { valid: false, error: 'No tiles placed!', score: 0 };
    }
    
    // Convert to grid positions
    const positions = newTiles.map(tile => {
        const pos = pixelToGrid(tile.x(), tile.y());
        const letter = tile.findOne('Text').text();
        const points = CONFIG.TILE_VALUES[letter] || 0;
        return { ...pos, tile, letter, points };
    });
    
    // Rule 2: First move must touch center (7,7)
    if (isFirstMove) {
        const touchesCenter = positions.some(p => p.gridX === 7 && p.gridY === 7);
        if (!touchesCenter) {
            return { valid: false, error: 'First word must cover the center star!', score: 0 };
        }
    }
    
    // Rule 3: All tiles must be in same row OR same column
    const allSameRow = positions.every(p => p.gridY === positions[0].gridY);
    const allSameCol = positions.every(p => p.gridX === positions[0].gridX);
    
    if (!allSameRow && !allSameCol) {
        return { valid: false, error: 'Tiles must be in a straight line!', score: 0 };
    }
    
    // Sort positions (left-to-right or top-to-bottom)
    positions.sort((a, b) => {
        if (allSameRow) return a.gridX - b.gridX;
        return a.gridY - b.gridY;
    });
    
    // Rule 4: No gaps allowed
    for (let i = 0; i < positions.length - 1; i++) {
        const current = positions[i];
        const next = positions[i + 1];
        
        if (allSameRow) {
            // Check for gaps in horizontal word
            const expectedNextX = current.gridX + 1;
            if (next.gridX !== expectedNextX) {
                // Check if gap is filled by existing tile
                let hasGap = true;
                for (let x = expectedNextX; x < next.gridX; x++) {
                    const existingTile = getTileAt(layer, x, current.gridY);
                    if (!existingTile || existingTile.status === 'played-this-turn') {
                        hasGap = true;
                        break;
                    }
                    hasGap = false;
                }
                if (hasGap) {
                    return { valid: false, error: 'No gaps allowed in your word!', score: 0 };
                }
            }
        } else {
            // Check for gaps in vertical word
            const expectedNextY = current.gridY + 1;
            if (next.gridY !== expectedNextY) {
                let hasGap = true;
                for (let y = expectedNextY; y < next.gridY; y++) {
                    const existingTile = getTileAt(layer, current.gridX, y);
                    if (!existingTile || existingTile.status === 'played-this-turn') {
                        hasGap = true;
                        break;
                    }
                    hasGap = false;
                }
                if (hasGap) {
                    return { valid: false, error: 'No gaps allowed in your word!', score: 0 };
                }
            }
        }
    }
    
    // Rule 5: Must connect to existing words (skip for first move)
    if (!isFirstMove) {
        let connects = false;
        
        for (const pos of positions) {
            // Check all 4 directions for existing tiles
            const neighbors = [
                getTileAt(layer, pos.gridX - 1, pos.gridY),
                getTileAt(layer, pos.gridX + 1, pos.gridY),
                getTileAt(layer, pos.gridX, pos.gridY - 1),
                getTileAt(layer, pos.gridX, pos.gridY + 1)
            ];
            
            // If any neighbor is locked (from previous turn), we connect
            if (neighbors.some(n => n && n.status === 'locked')) {
                connects = true;
                break;
            }
        }
        
        if (!connects) {
            return { valid: false, error: 'New tiles must connect to existing words!', score: 0 };
        }
    }
    
    // Calculate score with multipliers
    let baseScore = 0;
    let wordMultiplier = 1;
    
    for (const pos of positions) {
        let letterScore = pos.points;
        
        // Check if this tile is on a multiplier (only count for newly placed tiles)
        const multiplier = getMultiplierType(pos.gridX, pos.gridY);
        
        if (multiplier === 'DL') {
            letterScore *= 2;
            console.log(`Double Letter on ${pos.letter}: ${pos.points} × 2 = ${letterScore}`);
        } else if (multiplier === 'TL') {
            letterScore *= 3;
            console.log(`Triple Letter on ${pos.letter}: ${pos.points} × 3 = ${letterScore}`);
        } else if (multiplier === 'DW') {
            wordMultiplier *= 2;
            console.log(`Double Word multiplier found`);
        } else if (multiplier === 'TW') {
            wordMultiplier *= 3;
            console.log(`Triple Word multiplier found`);
        }
        
        baseScore += letterScore;
    }
    
    // Apply word multipliers
    let totalScore = baseScore * wordMultiplier;
    
    console.log(`Base score: ${baseScore}, Word multiplier: ${wordMultiplier}x, Total: ${totalScore}`);
    
    // Bingo bonus: Using all 7 tiles = +50 points
    if (newTiles.length === 7) {
        totalScore += 50;
        console.log('BINGO! +50 bonus');
    }
    
    return { valid: true, error: null, score: totalScore };
};

/**
 * Lock tiles on board (change status from 'played-this-turn' to 'locked')
 */
window.lockTilesOnBoard = function(layer) {
    layer.find('.tile-group').forEach(tile => {
        if (tile.status === 'played-this-turn') {
            tile.status = 'locked';
            
            // Remove click handlers so locked tiles can't be moved
            tile.off('click tap');
            
            console.log(`Locked tile: ${tile.findOne('Text').text()}`);
        }
    });
    
    // Mark that first move is complete
    isFirstMove = false;
};