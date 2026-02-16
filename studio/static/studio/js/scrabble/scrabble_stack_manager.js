/* 
 * FILE PURPOSE: Move History & Tile Selection Manager
 * Tracks tile placement history (for UNDO), manages tile selection state,
 * handles exchange mode, and processes click events for tile placement
 */

/* FILE: studio/static/studio/js/scrabble/scrabble_stack_manager.js */
/* DATE: 2026-02-15 11:30 AM */
/* SYNC: Integrated with GameManager for score updates and turn cycling */

let moveHistory = [];
let selectedTile = null;
let exchangeMode = false;
let tilesMarkedForExchange = [];
let submitting = false; // Prevent double-clicks

/**
 * Reset all tile highlights to default gold color
 * @param {Konva.Layer} layer - The game layer
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
        // EXCHANGE MODE: Toggle tile selection (bright orange, thick stroke)
        const tileRect = tile.findOne('Rect');
        const isAlreadyMarked = tilesMarkedForExchange.includes(tile);
        
        if (isAlreadyMarked) {
            // Deselect
            console.log('Deselecting tile for exchange');
            tileRect.stroke('#d4a017');
            tileRect.strokeWidth(2);
            tilesMarkedForExchange = tilesMarkedForExchange.filter(t => t !== tile);
        } else {
            // Select - BRIGHT ORANGE with THICK stroke
            console.log('Selecting tile for exchange (bright orange)');
            tileRect.stroke('#FF6600');
            tileRect.strokeWidth(4);
            tilesMarkedForExchange.push(tile);
        }
        console.log('Tiles marked for exchange:', tilesMarkedForExchange.length);
    } else {
        // NORMAL MODE: Single tile selection for placement (bright green, thick stroke)
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
        // Don't process board clicks in exchange mode
        if (exchangeMode) return;
        
        if (selectedTile && (e.target === stage || e.target.className === 'Rect' || e.target.className === 'Text')) {
            const pos = stage.getPointerPosition();
            
            // Calculate grid position accounting for board offset
            const gridX = Math.floor((pos.x - CONFIG.BOARD_X_OFFSET) / CONFIG.GRID_SIZE);
            const gridY = Math.floor((pos.y - CONFIG.BOARD_Y_OFFSET) / CONFIG.GRID_SIZE);
            
            // Check if click is within the board area
            if (gridX >= 0 && gridX < CONFIG.BOARD_SIZE && gridY >= 0 && gridY < CONFIG.BOARD_SIZE) {
                const nX = (gridX * CONFIG.GRID_SIZE) + CONFIG.BOARD_X_OFFSET;
                const nY = (gridY * CONFIG.GRID_SIZE) + CONFIG.BOARD_Y_OFFSET;
                
                moveHistory.push({ 
                    tile: selectedTile, 
                    oldPos: { x: selectedTile.x(), y: selectedTile.y() } 
                });
                
                selectedTile.position({ x: nX + 1, y: nY + 1 });
                
                // Mark tile as played this turn
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
        
        // Reset tile status back to in-rack
        last.tile.status = 'in-rack';
        
        last.tile.position(last.oldPos);
        layer.batchDraw();
    }
}

/**
 * Handle SUBMIT button click
 * @param {Konva.Layer} layer - The game layer
 */
window.handleSubmit = function(layer) {
    if (submitting) return; // Prevent double-click
    submitting = true;
    
    console.log('=== SUBMIT CLICKED ===');
    
    // Validate the move
    const result = window.validateSubmit(layer);
    
    if (!result.valid) {
        // Show error toast
        window.showToast(result.error, 'error', 3500);
        console.log('Validation failed:', result.error);
        submitting = false; // Reset
        return;
    }
    
    // Valid move!
    console.log('Valid move! Score:', result.score);
    
    // Update score via GameManager
    if (window.GameManager) {
        window.GameManager.updateScore(result.score);
    }
    
    // Lock tiles on board
    window.lockTilesOnBoard(layer);
    
    // Clear move history
    moveHistory = [];
    
    // Show success toast
    window.showToast(`Great move! +${result.score} points`, 'success', 3000);
    
    // Refill rack
    window.refillRack();
    
    // Next turn after 1 second delay
    setTimeout(() => {
        if (window.GameManager) {
            window.GameManager.nextTurn();
        }
        submitting = false;
    }, 1000);
    
    layer.batchDraw();
};

window.handleExchange = function(layer) {
    if (!exchangeMode) {
        // ENTER EXCHANGE MODE
        console.log('=== ENTERING EXCHANGE MODE ===');
        resetAllTileHighlights(layer);
        exchangeMode = true;
        layer.batchDraw();
        return true;
    } else {
        // EXECUTE EXCHANGE
        console.log('=== EXECUTING EXCHANGE ===');
        console.log('Exchanging tiles:', tilesMarkedForExchange.length);
        
        if (tilesMarkedForExchange.length === 0) {
            console.log('No tiles selected for exchange, cancelling');
            exchangeMode = false;
            return false;
        }
        
        // Remove selected tiles and spawn new ones
        const scale = CONFIG.IS_MOBILE ? CONFIG.STAGE_WIDTH / 800 : 1;
        const rackY = CONFIG.IS_MOBILE ? (CONFIG.STAGE_HEIGHT - 60 * scale) : (707 * scale);
        
        tilesMarkedForExchange.forEach((tile, index) => {
            const oldX = tile.x();
            
            // Remove old tile
            tile.destroy();
            
            // Draw new tile from bag
            const letter = window.drawTileFromBag();
            if (!letter) {
                console.log('Tile bag empty!');
                return;
            }
            
            const points = CONFIG.TILE_VALUES[letter] || 0;
            const newTile = createTile(layer, oldX, rackY, letter, points);
            
            // Set status as in-rack
            newTile.status = 'in-rack';
            
            // Add click handler
            newTile.on('click tap', (e) => {
                e.cancelBubble = true;
                if (typeof selectTile === 'function') {
                    selectTile(newTile);
                }
                layer.batchDraw();
            });
            
            // Animate it popping up
            animateNewTile(newTile, rackY, index * 0.1);
        });
        
        // Reset exchange mode
        tilesMarkedForExchange = [];
        exchangeMode = false;
        layer.batchDraw();
        
        // Exchange costs a turn
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