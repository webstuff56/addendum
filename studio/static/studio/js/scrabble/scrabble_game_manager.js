const GameManager = {
    currentTurn: 1,
    currentPlayerIndex: 1,
    
    players: [
        { name: 'Player 1', score: 0 },
        { name: 'Player 2', score: 0 },
        { name: 'Player 3', score: 0 },
        { name: 'Player 4', score: 0 }
    ],
    
    nameBoxes: [],
    scoreTexts: [],
    layer: null,
    tileBag: [],
    
    init(gameLayer) {
        this.layer = gameLayer;
        console.log('🎮 GameManager initialized');
    },
    
    registerPlayerUI(viewIndex, nameBox, scoreText) {
        this.nameBoxes[viewIndex] = nameBox;
        if (scoreText) {
            this.scoreTexts[viewIndex] = scoreText;
        }
        console.log(`📝 Registered UI for viewIndex ${viewIndex}`);
    },
    
    getActivePlayer() {
        return this.players[this.currentTurn];
    },
    
    updateNameHighlights() {
        console.log('🔦 updateNameHighlights called, currentTurn:', this.currentTurn);
        console.log('🔦 nameBoxes array length:', this.nameBoxes.length);
        
        const viewOrder = [
            (this.currentPlayerIndex + 2) % 4,
            this.currentPlayerIndex,
            (this.currentPlayerIndex + 1) % 4,
            (this.currentPlayerIndex + 3) % 4
        ];
        
        console.log('🔦 viewOrder:', viewOrder);
        
        this.nameBoxes.forEach((box, viewIndex) => {
            if (box) {
                const playerIndex = viewOrder[viewIndex];
                const isActive = (playerIndex === this.currentTurn);
                
                console.log(`🔦 viewIndex ${viewIndex} -> playerIndex ${playerIndex}, isActive: ${isActive}`);
                
                box.stroke(isActive ? '#FFD700' : 'black');
                box.strokeWidth(isActive ? 4 : 2);
                box.shadowColor(isActive ? '#FFD700' : 'transparent');
                box.shadowBlur(isActive ? 15 : 0);
                box.shadowOpacity(isActive ? 0.8 : 0);
            } else {
                console.log(`🔦 viewIndex ${viewIndex} has NO box!`);
            }
        });
        
        if (this.layer) {
            console.log('🔦 Calling layer.batchDraw()');
            this.layer.batchDraw();
        } else {
            console.log('🔦 NO LAYER!');
        }
    },
    
    updateScoreDisplay(playerIndex) {
        const viewOrder = [
            (this.currentPlayerIndex + 2) % 4,
            this.currentPlayerIndex,
            (this.currentPlayerIndex + 1) % 4,
            (this.currentPlayerIndex + 3) % 4
        ];
        
        const viewIndex = viewOrder.indexOf(playerIndex);
        
        if (viewIndex === -1) {
            console.warn(`Could not find viewIndex for player ${playerIndex}`);
            return;
        }
        
        const scoreText = this.scoreTexts[viewIndex];
        
        if (scoreText) {
            const player = this.players[playerIndex];
            scoreText.text(`Turn: 0\nTotal: ${player.score}`);
            console.log(`📊 Updated scoreboard for Player ${playerIndex + 1}: ${player.score} points`);
            
            if (this.layer) {
                this.layer.batchDraw();
            }
        } else {
            console.warn(`No scoreText found for viewIndex ${viewIndex}`);
        }
    },
    
    updateScore(points) {
        const player = this.getActivePlayer();
        player.score += points;
        
        console.log(`🎮 Player ${this.currentTurn + 1} scored ${points} points (total: ${player.score})`);
        
        this.updateScoreDisplay(this.currentTurn);
    },
    
    nextTurn() {
        this.currentTurn = (this.currentTurn + 1) % 4;
        
        console.log(`🎮 Turn advanced to Player ${this.currentTurn + 1}`);
        
        this.updateNameHighlights();
    },
    
    getAllPlayers() {
        return this.players;
    }
};

window.GameManager = GameManager;