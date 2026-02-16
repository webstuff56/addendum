/* 
 * FILE PURPOSE: Game State & Turn Management
 * Manages player state, turn cycling, score updates, and UI synchronization.
 * DUMMY VERSION: Hardcoded 4 players for single-player testing.
 * LATER: Replace with scrabble_multiplayer_manager.js for real multiplayer.
 */

/* FILE: studio/static/studio/js/scrabble/scrabble_game_manager.js */
/* DATE: 2026-02-15 11:00 AM */

const GameManager = {
    currentTurn: 1,
    
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
        this.currentTurn = 1;
        console.log('🎮 GameManager initialized');
    },
    
    registerPlayerUI(viewIndex, nameBox, scoreText) {
        this.nameBoxes[viewIndex] = nameBox;
        if (scoreText) {
            this.scoreTexts[viewIndex] = scoreText;
        }
    },
    
    getActivePlayer() {
        return this.players[this.currentTurn];
    },
    
    updateNameHighlights() {
        const currentPlayerIndex = 1;
        const viewOrder = [
            (currentPlayerIndex + 2) % 4,
            currentPlayerIndex,
            (currentPlayerIndex + 1) % 4,
            (currentPlayerIndex + 3) % 4
        ];
        
        const activeViewIndex = viewOrder.indexOf(this.currentTurn);
        
        this.nameBoxes.forEach((box, viewIndex) => {
            if (!box) return;
            
            const isActive = (viewIndex === activeViewIndex);
            
            if (isActive) {
                box.stroke('#FFD700');
                box.strokeWidth(4);
                box.shadowColor('#FFD700');
                box.shadowBlur(15);
                box.shadowOpacity(0.8);
            } else {
                box.stroke('black');
                box.strokeWidth(2);
                box.shadowBlur(0);
            }
        });
        
        if (this.layer) {
            this.layer.batchDraw();
        }
    },
    
    updateScoreDisplay(playerIndex) {
        const currentPlayerIndex = 1;
        const viewOrder = [
            (currentPlayerIndex + 2) % 4,
            currentPlayerIndex,
            (currentPlayerIndex + 1) % 4,
            (currentPlayerIndex + 3) % 4
        ];
        
        const viewIndex = viewOrder.indexOf(playerIndex);
        const scoreText = this.scoreTexts[viewIndex];
        
        if (scoreText) {
            const player = this.players[playerIndex];
            scoreText.text(`Turn: 0\nTotal: ${player.score}`);
            
            if (this.layer) {
                this.layer.batchDraw();
            }
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