/* 
 * FILE PURPOSE: Board & UI Renderer
 * Paints the Scrabble board (grid, multipliers), player racks, control buttons,
 * and scoreboards. Handles visual layout and button event binding.
 * Conditionally hides opponent elements on mobile screens.
 */

/* FILE: studio/static/studio/js/scrabble/scrabble_painter.js */
/* DATE: 2026-02-15 11:30 AM */
/* SYNC: Integrated with GameManager - registers UI elements for dynamic updates */

function paintBoard(layer, currentPlayerIndex = 1, currentTurn = 1) {
    const scale = CONFIG.IS_MOBILE ? CONFIG.STAGE_WIDTH / 800 : 1;
    
    const rackHeight = 40 * scale;
    const rackWidth = 40 * scale;
    const buttonWidth = 70 * scale;
    const buttonHeight = 30 * scale;
    const spacing = 80 * scale;
    const labels = ['SUBMIT', 'UNDO', 'EXCHANGE', 'PASS'];
    const colors = ['#4CAF50', '#cc0000', '#FF9800', '#9C27B0'];

    // Use GameManager players if available, otherwise fallback to hardcoded
    const allPlayers = window.GameManager ? 
        window.GameManager.getAllPlayers() : 
        [
            { name: 'Player 1', score: 0 },
            { name: 'Player 2', score: 0 },
            { name: 'Player 3', score: 0 },
            { name: 'Player 4', score: 0 }
        ];

    const viewOrder = [
        (currentPlayerIndex + 2) % 4,  // top
        currentPlayerIndex,             // bottom (YOU)
        (currentPlayerIndex + 1) % 4,   // left
        (currentPlayerIndex + 3) % 4    // right
    ];
    const players = viewOrder.map(idx => allPlayers[idx]);

    /**
     * Add button press animation
     */
    function addButtonPressAnimation(btn) {
        btn.on('mousedown touchstart', () => {
            btn.to({ scaleX: 0.95, scaleY: 0.95, duration: 0.1 });
        });
        btn.on('mouseup touchend', () => {
            btn.to({ scaleX: 1, scaleY: 1, duration: 0.1 });
        });
    }

    function drawAutoNameBox(groupX, groupY, name, rotation, font, isActivePlayer, rightAlign = false, bottomAlign = false, viewIndex = -1) {
        const group = new Konva.Group({ x: groupX * scale, y: groupY * scale });
        const txt = new Konva.Text({
            text: name,
            fontSize: 16 * scale,
            fontFamily: font,
            fill: 'black',
            padding: 10 * scale,
            align: 'center',
            verticalAlign: 'middle'
        });

        const w = txt.width();
        const h = txt.height();
        
        // Glow effect if it's this player's turn
        const rect = new Konva.Rect({
            width: w, height: h,
            fill: 'white', 
            stroke: isActivePlayer ? '#FFD700' : 'black', 
            strokeWidth: isActivePlayer ? 4 : 2,
            cornerRadius: 3,
            shadowColor: isActivePlayer ? '#FFD700' : 'transparent',
            shadowBlur: isActivePlayer ? 15 : 0,
            shadowOpacity: isActivePlayer ? 0.8 : 0
        });

        if (rightAlign && rotation === 0) {
            rect.x(-w);
            txt.x(-w);
        }

        if (rotation === 90) {
            txt.x(h);
            txt.rotation(90);
            rect.width(h); 
            rect.height(w);
            
            if (bottomAlign) {
                rect.y(-w);
                txt.y(-w);
            }
        } else if (rotation === 180) {
            txt.x(w); 
            txt.y(h); 
            txt.rotation(180);
        } else if (rotation === 270) {
            txt.y(w); 
            txt.rotation(270);
            rect.width(h); 
            rect.height(w);
        }

        group.add(rect);
        group.add(txt);
        layer.add(group);
        
        // Register with GameManager
        if (viewIndex >= 0 && window.GameManager) {
            window.GameManager.registerPlayerUI(viewIndex, rect, null);
        }
        
        return { rect, group };
    }

    // ========== TOP SECTION (HIDDEN ON MOBILE) ==========
    if (!CONFIG.IS_MOBILE) {
        layer.add(new Konva.Rect({ 
            x: 200 * scale, y: 52 * scale, width: 400 * scale, height: rackHeight, 
            fill: CONFIG.COLORS.RACK_WOOD, stroke: CONFIG.COLORS.RACK_STROKE, 
            strokeWidth: 4, cornerRadius: 5, name: 'opponent-rack' 
        }));
        
        const topControlGroup = new Konva.Group({ x: 580 * scale, y: 40 * scale, rotation: 180, name: 'opponent-controls' });
        for (let i = 0; i < 4; i++) {
            const btn = new Konva.Group({ x: i * 80 * scale, y: 0 });
            btn.add(new Konva.Rect({ width: buttonWidth, height: buttonHeight, fill: colors[i], cornerRadius: 5 }));
            btn.add(new Konva.Text({ text: labels[i], fontSize: 11 * scale, fill: 'white', width: buttonWidth, padding: 8 * scale, align: 'center' }));
            topControlGroup.add(btn);
        }
        layer.add(topControlGroup);

        const topActivePlayer = viewOrder.indexOf(currentTurn) === 0;
        drawAutoNameBox(608, 52, players[0].name, 180, 'Playwrite IN Guides', topActivePlayer, false, false, 0);
        
        const topScoreBox = new Konva.Group({ x: 98 * scale, y: 52 * scale, name: 'opponent-scoreboard' });
        topScoreBox.add(new Konva.Rect({ width: 94 * scale, height: 40 * scale, fill: 'white', stroke: CONFIG.COLORS.RACK_STROKE, strokeWidth: 2 }));
        const topScoreText = new Konva.Text({ 
            text: `Turn: 0\nTotal: ${players[0].score}`, 
            fontSize: 16 * scale, fill: 'black', fontFamily: 'Open Sans', 
            width: 94 * scale, height: 40 * scale, align: 'center', verticalAlign: 'middle', 
            rotation: 180, x: 42 * scale, y: 20 * scale, offsetX: 47 * scale, offsetY: 20 * scale 
        });
        topScoreBox.add(topScoreText);
        layer.add(topScoreBox);
        
        // Register score text with GameManager
        if (window.GameManager) {
            window.GameManager.scoreTexts[0] = topScoreText;
        }
    }

    // ========== BOTTOM SECTION (ALWAYS VISIBLE - YOUR RACK) ==========
    const bottomRackY = CONFIG.IS_MOBILE ? CONFIG.STAGE_HEIGHT - 60 * scale : 708 * scale;
    const bottomControlY = CONFIG.IS_MOBILE ? CONFIG.STAGE_HEIGHT - 10 * scale : 756 * scale;
    
    layer.add(new Konva.Rect({ 
        x: 200 * scale, y: bottomRackY, width: 400 * scale, height: rackHeight, 
        fill: CONFIG.COLORS.RACK_WOOD, stroke: CONFIG.COLORS.RACK_STROKE, 
        strokeWidth: 4, cornerRadius: 5, name: 'player-rack' 
    }));
    
    for (let i = 0; i < 4; i++) {
        const btn = new Konva.Group({ x: (260 + (i * 80)) * scale, y: bottomControlY });
        const btnRect = new Konva.Rect({ 
            width: buttonWidth, height: buttonHeight, fill: colors[i], 
            cornerRadius: 5, name: 'button-rect',
            shadowColor: 'black',
            shadowBlur: 3,
            shadowOffset: { x: 0, y: 2 },
            shadowOpacity: 0.3
        });
        const btnText = new Konva.Text({ text: labels[i], fontSize: 11 * scale, fill: 'white', width: buttonWidth, padding: 10 * scale, align: 'center' });
        
        btn.add(btnRect);
        btn.add(btnText);
        
        addButtonPressAnimation(btn);
        
        if (i === 0) { // SUBMIT
            btn.on('click tap', () => {
                console.log('SUBMIT clicked!');
                if (typeof window.handleSubmit === 'function') {
                    window.handleSubmit(layer);
                }
            });
        } else if (i === 1) { // UNDO
            btn.on('click tap', () => {
                console.log('UNDO clicked!');
                if (typeof window.handleUndo === 'function') {
                    window.handleUndo(layer);
                }
            });
        } else if (i === 2) { // EXCHANGE
            btn.on('click tap', () => {
                console.log('EXCHANGE clicked!');
                if (typeof window.handleExchange === 'function') {
                    const enteringMode = window.handleExchange(layer);
                    
                    if (enteringMode) {
                        btnRect.strokeWidth(4);
                        btnRect.stroke('#FFD700');
                    } else {
                        btnRect.strokeWidth(0);
                    }
                    layer.batchDraw();
                }
            });
        } else if (i === 3) { // PASS
            btn.on('click tap', () => {
                console.log('PASS clicked!');
                if (window.GameManager) {
                    window.GameManager.nextTurn();
                    window.showToast('Turn passed', 'info', 2000);
                }
            });
        }
        
        layer.add(btn);
    }
    
    const bottomActivePlayer = viewOrder.indexOf(currentTurn) === 1;
    drawAutoNameBox(192, CONFIG.IS_MOBILE ? bottomRackY / scale : 708, players[1].name, 0, 'Playwrite IN Guides', bottomActivePlayer, true, false, 1);
    
    const bottomScoreBox = new Konva.Group({ x: 608 * scale, y: bottomRackY });
    bottomScoreBox.add(new Konva.Rect({ width: 94 * scale, height: 40 * scale, fill: 'white', stroke: CONFIG.COLORS.RACK_STROKE, strokeWidth: 2 }));
    const bottomScoreText = new Konva.Text({ 
        text: `Turn: 0\nTotal: ${players[1].score}`, 
        fontSize: 16 * scale, fill: 'black', fontFamily: 'Open Sans', 
        width: 94 * scale, height: 40 * scale, align: 'center', verticalAlign: 'middle' 
    });
    bottomScoreBox.add(bottomScoreText);
    layer.add(bottomScoreBox);
    
    // Register score text
    if (window.GameManager) {
        window.GameManager.scoreTexts[1] = bottomScoreText;
    }

    // ========== LEFT SECTION (HIDDEN ON MOBILE) ==========
    if (!CONFIG.IS_MOBILE) {
        layer.add(new Konva.Rect({ 
            x: 52 * scale, y: 200 * scale, width: rackWidth, height: 400 * scale, 
            fill: CONFIG.COLORS.RACK_WOOD, stroke: CONFIG.COLORS.RACK_STROKE, 
            strokeWidth: 4, cornerRadius: 5, name: 'opponent-rack' 
        }));
        
        for (let i = 0; i < 4; i++) {
            const btn = new Konva.Group({ x: 12 * scale, y: (214 + (i * 80)) * scale, name: 'opponent-controls' });
            btn.add(new Konva.Rect({ width: 30 * scale, height: 70 * scale, fill: colors[i], cornerRadius: 5 }));
            btn.add(new Konva.Text({ text: labels[i], fontSize: 10 * scale, fill: 'white', width: 70 * scale, height: 30 * scale, rotation: 90, x: 15 * scale, y: 35 * scale, offsetX: 35 * scale, offsetY: 15 * scale, align: 'center', verticalAlign: 'middle' }));
            layer.add(btn);
        }
        
        const leftActivePlayer = viewOrder.indexOf(currentTurn) === 2;
        drawAutoNameBox(52, 192, players[2].name, 90, 'Playwrite IN Guides', leftActivePlayer, false, true, 2);
        
        const leftScoreBox = new Konva.Group({ x: 52 * scale, y: 608 * scale, name: 'opponent-scoreboard' });
        leftScoreBox.add(new Konva.Rect({ width: 40 * scale, height: 94 * scale, fill: 'white', stroke: CONFIG.COLORS.RACK_STROKE, strokeWidth: 2 }));
        const leftScoreText = new Konva.Text({ 
            text: `Turn: 0\nTotal: ${players[2].score}`, 
            fontSize: 16 * scale, fill: 'black', fontFamily: 'Open Sans', 
            width: 94 * scale, height: 40 * scale, align: 'center', verticalAlign: 'middle', 
            rotation: 90, x: 60 * scale, y: 50 * scale, offsetX: 47 * scale, offsetY: -20 * scale 
        });
        leftScoreBox.add(leftScoreText);
        layer.add(leftScoreBox);
        
        if (window.GameManager) {
            window.GameManager.scoreTexts[2] = leftScoreText;
        }
    }

    // ========== RIGHT SECTION (HIDDEN ON MOBILE) ==========
    if (!CONFIG.IS_MOBILE) {
        layer.add(new Konva.Rect({ 
            x: 708 * scale, y: 200 * scale, width: rackWidth, height: 400 * scale, 
            fill: CONFIG.COLORS.RACK_WOOD, stroke: CONFIG.COLORS.RACK_STROKE, 
            strokeWidth: 4, cornerRadius: 5, name: 'opponent-rack' 
        }));
        
        for (let i = 0; i < 4; i++) {
            const btn = new Konva.Group({ x: 758 * scale, y: (228 + (i * 80)) * scale, name: 'opponent-controls' });
            btn.add(new Konva.Rect({ width: 30 * scale, height: 70 * scale, fill: colors[i], cornerRadius: 5 }));
            btn.add(new Konva.Text({ text: labels[i], fontSize: 10 * scale, fill: 'white', width: 70 * scale, height: 30 * scale, rotation: 270, x: 15 * scale, y: 35 * scale, offsetX: 35 * scale, offsetY: 15 * scale, align: 'center', verticalAlign: 'middle' }));
            layer.add(btn);
        }
        
        const rightActivePlayer = viewOrder.indexOf(currentTurn) === 3;
        drawAutoNameBox(708, 608, players[3].name, 270, 'Playwrite IN Guides', rightActivePlayer, false, false, 3);
        
        const rightScoreBox = new Konva.Group({ x: 708 * scale, y: 104 * scale, name: 'opponent-scoreboard' });
        rightScoreBox.add(new Konva.Rect({ width: 40 * scale, height: 94 * scale, fill: 'white', stroke: CONFIG.COLORS.RACK_STROKE, strokeWidth: 2 }));
        const rightScoreText = new Konva.Text({ 
            text: `Turn: 0\nTotal: ${players[3].score}`, 
            fontSize: 16 * scale, fill: 'black', fontFamily: 'Open Sans', 
            width: 94 * scale, height: 40 * scale, align: 'center', verticalAlign: 'middle', 
            rotation: 270, x: 20 * scale, y: 54 * scale, offsetX: 47 * scale, offsetY: 20 * scale 
        });
        rightScoreBox.add(rightScoreText);
        layer.add(rightScoreBox);
        
        if (window.GameManager) {
            window.GameManager.scoreTexts[3] = rightScoreText;
        }
    }

    // ========== GRID RENDERING WITH CENTER STAR ==========
    for (var i = 0; i < CONFIG.BOARD_SIZE; i++) {
        for (var j = 0; j < CONFIG.BOARD_SIZE; j++) {
            let x = (i * CONFIG.GRID_SIZE) + CONFIG.BOARD_X_OFFSET;
            let y = (j * CONFIG.GRID_SIZE) + CONFIG.BOARD_Y_OFFSET;
            let coord = `${i},${j}`;
            let bgColor = CONFIG.COLORS.DEFAULT_CELL;
            let label = "";
            
            // Center star (7,7)
            if (i === 7 && j === 7) {
                bgColor = '#FFD700'; // Gold center
                label = "★";
            } else if (CONFIG.MULTIPLIERS.TW.includes(coord)) { 
                bgColor = CONFIG.COLORS.TW; label = "TW"; 
            } else if (CONFIG.MULTIPLIERS.DW.includes(coord)) { 
                bgColor = CONFIG.COLORS.DW; label = "DW"; 
            } else if (CONFIG.MULTIPLIERS.TL.includes(coord)) { 
                bgColor = CONFIG.COLORS.TL; label = "TL"; 
            } else if (CONFIG.MULTIPLIERS.DL.includes(coord)) { 
                bgColor = CONFIG.COLORS.DL; label = "DL"; 
            }
            
            layer.add(new Konva.Rect({ x: x, y: y, width: CONFIG.GRID_SIZE, height: CONFIG.GRID_SIZE, stroke: CONFIG.COLORS.GRID_LINE, fill: bgColor }));
            
            if (label) { 
                layer.add(new Konva.Text({ 
                    x: x, 
                    y: y + (label === "★" ? 5 * scale : 15 * scale), 
                    width: CONFIG.GRID_SIZE, 
                    text: label, 
                    fontSize: label === "★" ? 24 * scale : 8 * scale,
                    fill: label === "★" ? 'white' : 'black',
                    align: 'center' 
                })); 
            }
        }
    }
}