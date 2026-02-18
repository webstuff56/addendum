/* 
 * FILE PURPOSE: Move History & Tile Selection Manager
 * Tracks tile placement history (for UNDO), manages tile selection state,
 * handles exchange mode, and processes click events for tile placement
 */

/* FILE: studio/static/studio/js/scrabble/scrabble_stack_manager.js */
/* DATE: 2026-02-17 13:00 PM */
/* SYNC: Fixed word validation to include existing tiles in the word */

let moveHistory = [];
let selectedTile = null;
let exchangeMode = false;
let tilesMarkedForExchange = [];
let submitting = false;

/**
 * Reset all tile highlights to default gold color
 */
function resetAllTileHighlights(layer) {
    layer.find('.tile-group').forEach(tile => {
        const rect = tile.findOne('Rect');
        if (rect) {
            rect.stroke('#d4a017');
            rect.strokeWidth(2);
        }
    });
    selectedTile = null;
    tilesMarkedForExchange = [];
}

function selectTile(tile) {
    console.log('selectTile called, exchangeMode:', exchangeMode);
    
    if (exchangeMode) {
        const tileRect = tile.findOne('Rect');
        const isAlreadyMarked = tilesMarkedForExchange.includes(tile);
        
        if (isAlreadyMarked) {
            console.log('Deselecting tile for exchange');
            tileRect.stroke('#d4a017');
            tileRect.strokeWidth(2);
            tilesMarkedForExchange = tilesMarkedForExchange.filter(t => t !== tile);
        } else {
            console.log('Selecting tile for exchange (bright orange)');
            tileRect.stroke('#FF6600');
            tileRect.strokeWidth(4);
            tilesMarkedForExchange.push(tile);
        }
        console.log('Tiles marked for exchange:', tilesMarkedForExchange.length);
    } else {
        if (selectedTile) {
            const oldRect = selectedTile.findOne('Rect');
            oldRect.stroke('#d4a017');
            oldRect.strokeWidth(2);
        }
        selectedTile = tile;
        const tileRect = tile.findOne('Rect');
        tileRect.stroke('#00ff00');
        tileRect.strokeWidth(4);
        console.log('Tile selected for placement (bright green)');
    }
}

function initStackManager(stage, layer) {
    stage.on('click tap', (e) => {
        if (exchangeMode) return;
        
        if (selectedTile && (e.target === stage || e.target.className === 'Rect' || e.target.className === 'Text')) {
            const pos = stage.getPointerPosition();
            
            const gridX = Math.floor((pos.x - CONFIG.BOARD_X_OFFSET) / CONFIG.GRID_SIZE);
            const gridY = Math.floor((pos.y - CONFIG.BOARD_Y_OFFSET) / CONFIG.GRID_SIZE);
            
            if (gridX >= 0 && gridX < CONFIG.BOARD_SIZE && gridY >= 0 && gridY < CONFIG.BOARD_SIZE) {
                const nX = (gridX * CONFIG.GRID_SIZE) + CONFIG.BOARD_X_OFFSET;
                const nY = (gridY * CONFIG.GRID_SIZE) + CONFIG.BOARD_Y_OFFSET;
                
                moveHistory.push({ 
                    tile: selectedTile, 
                    oldPos: { x: selectedTile.x(), y: selectedTile.y() } 
                });
                
                selectedTile.position({ x: nX + 1, y: nY + 1 });
                selectedTile.status = 'played-this-turn';
                
                const rect = selectedTile.findOne('Rect');
                rect.stroke('#d4a017');
                rect.strokeWidth(2);
                selectedTile = null;
                layer.batchDraw();
            }
        }
    });
}

window.handleUndo = function(layer) {
    if (moveHistory.length > 0) {
        let last = moveHistory.pop();
        last.tile.status = 'in-rack';
        last.tile.position(last.oldPos);
        layer.batchDraw();
    }
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
 * Handle SUBMIT button click with auto-validation
 */
window.handleSubmit = async function(layer) {
    if (submitting) return;
    submitting = true;
    
    console.log('=== SUBMIT CLICKED ===');
    
    // Step 1: Validate placement rules (straight line, no gaps, etc.)
    const result = window.validateSubmit(layer);
    
    if (!result.valid) {
        window.showToast(result.error, 'error', 3500);
        console.log('Placement validation failed:', result.error);
        submitting = false;
        return;
    }
    
    console.log('Placement valid! Score would be:', result.score);
    
    // Step 2: Get the newly placed tiles
    const newTiles = [];
    layer.find('.tile-group').forEach(tile => {
        if (tile.status === 'played-this-turn') {
            const gridPos = pixelToGrid(tile.x(), tile.y());
            const letter = tile.findOne('Text').text();
            newTiles.push({ ...gridPos, tile, letter });
        }
    });
    
    // Sort to determine direction
    const allSameRow = newTiles.every(t => t.gridY === newTiles[0].gridY);
    newTiles.sort((a, b) => {
        if (allSameRow) return a.gridX - b.gridX;
        return a.gridY - b.gridY;
    });
    
    // Step 3: Build the COMPLETE word including existing tiles
    const firstNew = newTiles[0];
    const lastNew = newTiles[newTiles.length - 1];
    
    let startPos, endPos;
    
    if (allSameRow) {
        // Horizontal word - extend to include any locked tiles before/after
        const row = firstNew.gridY;
        startPos = firstNew.gridX;
        endPos = lastNew.gridX;
        
        // Extend backwards
        while (startPos > 0) {
            const tile = getTileAt(layer, startPos - 1, row);
            if (tile && tile.status === 'locked') {
                startPos--;
            } else {
                break;
            }
        }
        
        // Extend forwards
        while (endPos < CONFIG.BOARD_SIZE - 1) {
            const tile = getTileAt(layer, endPos + 1, row);
            if (tile && tile.status === 'locked') {
                endPos++;
            } else {
                break;
            }
        }
        
        // Build complete word
        const fullWordTiles = [];
        for (let x = startPos; x <= endPos; x++) {
            const tile = getTileAt(layer, x, row);
            if (tile) {
                const letter = tile.findOne('Text').text();
                fullWordTiles.push({ gridX: x, gridY: row, letter });
            }
        }
        
        const word = fullWordTiles.map(t => t.letter).join('');
        console.log('Complete horizontal word to validate:', word);
        
        // Validate this word
        if (!(await validateWord(word))) {
            window.showToast(`"${word}" is not a valid word! Try again.`, 'error', 4000);
            returnTilesToRack();
            submitting = false;
            return;
        }
        
    } else {
        // Vertical word - extend to include any locked tiles above/below
        const col = firstNew.gridX;
        startPos = firstNew.gridY;
        endPos = lastNew.gridY;
        
        // Extend upwards
        while (startPos > 0) {
            const tile = getTileAt(layer, col, startPos - 1);
            if (tile && tile.status === 'locked') {
                startPos--;
            } else {
                break;
            }
        }
        
        // Extend downwards
        while (endPos < CONFIG.BOARD_SIZE - 1) {
            const tile = getTileAt(layer, col, endPos + 1);
            if (tile && tile.status === 'locked') {
                endPos++;
            } else {
                break;
            }
        }
        
        // Build complete word
        const fullWordTiles = [];
        for (let y = startPos; y <= endPos; y++) {
            const tile = getTileAt(layer, col, y);
            if (tile) {
                const letter = tile.findOne('Text').text();
                fullWordTiles.push({ gridX: col, gridY: y, letter });
            }
        }
        
        const word = fullWordTiles.map(t => t.letter).join('');
        console.log('Complete vertical word to validate:', word);
        
        // Validate this word
        if (!(await validateWord(word))) {
            window.showToast(`"${word}" is not a valid word! Try again.`, 'error', 4000);
            returnTilesToRack();
            submitting = false;
            return;
        }
    }
    
    // VALID WORD - proceed with scoring
    console.log('Valid word! Proceeding with score:', result.score);
    window.showToast(`Valid word! +${result.score} points`, 'success', 3000);
    
    if (window.GameManager) {
        window.GameManager.updateScore(result.score);
    }
    
    window.lockTilesOnBoard(layer);
    moveHistory = [];
    
    window.refillRack();
    
    setTimeout(() => {
        if (window.GameManager) {
            window.GameManager.nextTurn();
        }
        submitting = false;
    }, 1000);
    
    layer.batchDraw();
    
    /**
     * Helper: Validate word via API
     */
    async function validateWord(word) {
        console.log('Checking word validity:', word);
        window.showToast(`Checking "${word}"...`, 'info', 1500);
        
        try {
            const response = await fetch('/studio/api/validate-word/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ word: word })
            });
            
            const data = await response.json();
            console.log('Dictionary response:', data);
            
            return data.valid;
            
        } catch (error) {
            console.error('Dictionary validation error:', error);
            window.showToast('Error checking word - please try again', 'error', 3000);
            return false;
        }
    }
    
    /**
     * Helper: Return tiles to rack
     */
    function returnTilesToRack() {
        console.log('Invalid word - tiles returned to rack');
        while (moveHistory.length > 0) {
            let last = moveHistory.pop();
            last.tile.status = 'in-rack';
            last.tile.position(last.oldPos);
        }
        layer.batchDraw();
    }
};

window.handleExchange = function(layer) {
    if (!exchangeMode) {
        console.log('=== ENTERING EXCHANGE MODE ===');
        resetAllTileHighlights(layer);
        exchangeMode = true;
        layer.batchDraw();
        return true;
    } else {
        console.log('=== EXECUTING EXCHANGE ===');
        console.log('Exchanging tiles:', tilesMarkedForExchange.length);
        
        if (tilesMarkedForExchange.length === 0) {
            console.log('No tiles selected for exchange, cancelling');
            exchangeMode = false;
            return false;
        }
        
        const scale = CONFIG.IS_MOBILE ? CONFIG.STAGE_WIDTH / 800 : 1;
        const rackY = CONFIG.IS_MOBILE ? (CONFIG.STAGE_HEIGHT - 60 * scale) : (707 * scale);
        
        tilesMarkedForExchange.forEach((tile, index) => {
            const oldX = tile.x();
            tile.destroy();
            
            const letter = window.drawTileFromBag();
            if (!letter) {
                console.log('Tile bag empty!');
                return;
            }
            
            const points = CONFIG.TILE_VALUES[letter] || 0;
            const newTile = createTile(layer, oldX, rackY, letter, points);
            newTile.status = 'in-rack';
            
            newTile.on('click tap', (e) => {
                e.cancelBubble = true;
                if (typeof selectTile === 'function') {
                    selectTile(newTile);
                }
                layer.batchDraw();
            });
            
            animateNewTile(newTile, rackY, index * 0.1);
        });
        
        tilesMarkedForExchange = [];
        exchangeMode = false;
        layer.batchDraw();
        
        if (window.GameManager) {
            setTimeout(() => {
                window.GameManager.nextTurn();
                window.showToast('Tiles exchanged - turn passed', 'info', 2000);
            }, 500);
        }
        
        console.log('=== EXCHANGE COMPLETE ===');
        return false;
    }
}

/**
 * Convert pixel coordinates to grid coordinates
 */
function pixelToGrid(x, y) {
    const gridX = Math.floor((x - CONFIG.BOARD_X_OFFSET) / CONFIG.GRID_SIZE);
    const gridY = Math.floor((y - CONFIG.BOARD_Y_OFFSET) / CONFIG.GRID_SIZE);
    return { gridX, gridY };
}