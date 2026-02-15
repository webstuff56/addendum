/* 
 * FILE PURPOSE: Game Configuration & Constants
 * Defines board dimensions, colors, multiplier positions, tile point values,
 * and responsive breakpoints. Calculates board size dynamically based on screen width.
 */

/* FILE: studio/static/studio/js/scrabble/scrabble_settings.js */
/* DATE: 2026-02-14 04:00 PM */
/* SYNC: Added TILE_VALUES lookup table with correct Scrabble point values */

// Detect if mobile (screen width < 768px)
const isMobile = () => window.innerWidth < 768;

// Calculate responsive dimensions
const getResponsiveDimensions = () => {
    if (isMobile()) {
        const containerWidth = Math.min(window.innerWidth - 20, 420);
        return {
            STAGE_WIDTH: containerWidth,
            STAGE_HEIGHT: containerWidth,
            GRID_SIZE: Math.floor(containerWidth / 20),
            BOARD_X_OFFSET: Math.floor(containerWidth / 20),
            BOARD_Y_OFFSET: Math.floor(containerWidth / 20)
        };
    } else {
        return {
            STAGE_WIDTH: 800,
            STAGE_HEIGHT: 800,
            GRID_SIZE: 40,
            BOARD_X_OFFSET: 100,
            BOARD_Y_OFFSET: 100
        };
    }
};

const dims = getResponsiveDimensions();

const CONFIG = {
    GRID_SIZE: dims.GRID_SIZE,
    BOARD_SIZE: 15,
    BOARD_X_OFFSET: dims.BOARD_X_OFFSET,
    BOARD_Y_OFFSET: dims.BOARD_Y_OFFSET,
    STAGE_WIDTH: dims.STAGE_WIDTH,     
    STAGE_HEIGHT: dims.STAGE_HEIGHT,
    IS_MOBILE: isMobile(),
    
    DICTIONARY_URL: 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt',
    
    // Scrabble tile point values
    TILE_VALUES: {
        'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1,
        'F': 4, 'G': 2, 'H': 4, 'I': 1, 'J': 8,
        'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1,
        'P': 3, 'Q': 10, 'R': 1, 'S': 1, 'T': 1,
        'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4,
        'Z': 10, ' ': 0  // Blank tile = 0
    },
    
    MULTIPLIERS: {
        TW: ['0,0', '0,7', '0,14', '7,0', '7,14', '14,0', '14,7', '14,14'],
        DW: ['1,1', '2,2', '3,3', '4,4', '10,10', '11,11', '12,12', '13,13', '1,13', '2,12', '3,11', '4,10'],
        TL: ['1,5', '1,9', '5,1', '5,5', '5,9', '5,13', '9,1', '9,5', '9,9', '9,13', '13,5', '13,9'],
        DL: ['0,3', '0,11', '2,6', '2,8', '3,0', '3,7', '3,14', '6,2', '6,6', '6,8', '6,12', '7,3', '7,11']
    },
    
    COLORS: {
        TW: '#ff6666', DW: '#ffcccc', TL: '#3399ff', DL: '#add8e6',
        DEFAULT_CELL: '#fdfdfd', GRID_LINE: '#bdc3c7',
        RACK_WOOD: '#8b4513', RACK_STROKE: '#5d2e0a'
    }
};