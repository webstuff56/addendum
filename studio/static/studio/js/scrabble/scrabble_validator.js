/* 
 * FILE PURPOSE: Move Validation & Scoring Engine
 * Validates tile placements, calculates scores with multipliers,
 * and enforces Scrabble rules (straight lines, connections, center star).
 */

/* FILE: studio/static/studio/js/scrabble/scrabble_validator.js */
/* DATE: 2026-02-14 06:00 PM */
/* SYNC: Initial validation and scoring system */

// Track first move status
let isFirstMove = true;

/**
 * Find all tiles placed this turn
 * @param {Konva.Layer} layer - The game layer
 * @returns {Array} - Array of newly placed tiles
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
 * @param {Konva.Layer} layer - The game layer
 * @param {number} gridX - Grid X coordinate
 * @param {number} gridY - Grid Y coordinate
 * @returns {Object|null} - Tile object or null
 */
function getTileAt(layer, gridX, gridY) {
    const targetX = (gridX * CONFIG.GRID_SIZE) + CONFIG.BOARD_X_OFFSET + 1;
    const targetY = (gridY * CONFIG.GRID_SIZE) + CONFIG.BOARD_Y_OFFSET + 1;
    
    let foundTile = null;
    layer.find('.tile-group').forEach(tile => {
        if (Math.abs(tile.x() - targetX) < 5 && Math.abs(tile.y() - targetY) < 5) {
            foundTile = tile;
        }
    });
    return foundTile;
}

/**
 * Convert pixel position to grid coordinates
 * @param {number} x - Pixel X
 * @param {number} y - Pixel Y
 * @returns {Object} - {gridX, gridY}
 */
function pixelToGrid(x, y) {
    return {
        gridX: Math.floor((x - CONFIG.BOARD_X_OFFSET) / CONFIG.GRID_SIZE),
        gridY: Math.floor((y - CONFIG.BOARD_Y_OFFSET) / CONFIG.GRID_SIZE)
    };
}

/**
 * Validate SUBMIT - check placement rules
 * @param {Konva.Layer} layer - The game layer
 * @returns {Object} - {valid: boolean, error: string, score: number}
 */
window.validateSubmit = function(layer) {
    const newTiles = getNewlyPlacedTiles(layer);
    
    // No tiles placed
    if (newTiles.length === 0) {
        return { valid: false, error: 'No tiles placed!' };
    }
    
    // Get grid positions
    const positions = newTiles.map(tile => {
        const pos = pixelToGrid(tile.x(), tile.y());
        return { tile, ...pos };
    });
    
    // Check if first move
    if (isFirstMove) {
        const touchesCenter = positions.some(p => p.gridX === 7 && p.gridY === 7);
        if (!touchesCenter) {
            return { valid: false, error: 'First word must cover the center star!' };
        }
    }
    
    // Check if tiles are in a straight line
    const allSameRow = positions.every(p => p.gridY === positions[0].gridY);
    const allSameCol = positions.every(p => p.gridX === positions[0].gridX);
    
    if (!allSameRow && !allSameCol) {
        return { valid: false, error: 'Tiles must be in a straight line!' };
    }
    
    // Check for gaps
    if (allSameRow) {
        const row = positions[0].gridY;
        const xCoords = positions.map(p => p.gridX).sort((a, b) => a - b);
        for (let x = xCoords[0]; x <= xCoords[xCoords.length - 1]; x++) {
            const tileHere = getTileAt(layer, x, row);
            if (!tileHere) {
                return { valid: false, error: 'No gaps allowed in your word!' };
            }
        }
    } else {
        const col = positions[0].gridX;
        const yCoords = positions.map(p => p.gridY).sort((a, b) => a - b);
        for (let y = yCoords[0]; y <= yCoords[yCoords.length - 1]; y++) {
            const tileHere = getTileAt(layer, col, y);
            if (!tileHere) {
                return { valid: false, error: 'No gaps allowed in your word!' };
            }
        }
    }
    
    // Check if connects to existing words (skip for first move)
    if (!isFirstMove) {
        const hasConnection = positions.some(p => {
            // Check adjacent cells for existing tiles
            const adjacent = [
                getTileAt(layer, p.gridX - 1, p.gridY),
                getTileAt(layer, p.gridX + 1, p.gridY),
                getTileAt(layer, p.gridX, p.gridY - 1),
                getTileAt(layer, p.gridX, p.gridY + 1)
            ];
            return adjacent.some(t => t && t.status === 'locked');
        });
        
        if (!hasConnection) {
            return { valid: false, error: 'New tiles must connect to existing words!' };
        }
    }
    
    // Calculate score (simplified for now - just letter values)
    let score = 0;
    newTiles.forEach(tile => {
        const letter = tile.findOne('Text').text();
        score += CONFIG.TILE_VALUES[letter] || 0;
    });
    
    // Bonus for using all 7 tiles
    if (newTiles.length === 7) {
        score += 50;
    }
    
    return { valid: true, score };
};

/**
 * Lock tiles on board (after successful SUBMIT)
 * @param {Konva.Layer} layer - The game layer
 */
window.lockTilesOnBoard = function(layer) {
    layer.find('.tile-group').forEach(tile => {
        if (tile.status === 'played-this-turn') {
            tile.status = 'locked';
            // Make tile non-selectable
            tile.off('click tap');
        }
    });
    isFirstMove = false;
};