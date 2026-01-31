/* FILE: studio/static/studio/js/studio_engine.js 
   SYNC: 2026-01-31 11:55 AM
   REASON: Moving original Konva logic to external engine; preserving 100px pieces and labels.
------------------------------------------------------------------------------- */

var stage, layer;

function initStudio() {
    // 1. Create the Stage
    stage = new Konva.Stage({
        container: 'konva-holder',
        width: 800,
        height: 600
    });

    layer = new Konva.Layer();
    stage.add(layer);

    // 2. The Original Piece Prototype (100px x 100px)
    function createPiece(x, y, color, label) {
        var group = new Konva.Group({
            x: x,
            y: y,
            draggable: true
        });

        var rect = new Konva.Rect({
            width: 100,
            height: 100,
            fill: color,
            stroke: 'black',
            strokeWidth: 2,
            cornerRadius: 10,
            shadowBlur: 5
        });

        var text = new Konva.Text({
            text: label,
            fontSize: 18,
            width: 100,
            padding: 20,
            align: 'center',
            fill: 'white'
        });

        group.add(rect).add(text);
        
        // Visual feedback for cursor
        group.on('mouseover', function () { document.body.style.cursor = 'pointer'; });
        group.on('mouseout', function () { document.body.style.cursor = 'default'; });

        layer.add(group);
    }

    // 3. Render the specific pieces YOU created
    createPiece(50, 50, '#006b54', 'Scrabble Tile');
    createPiece(200, 50, '#b5a42e', 'Poker Card');

    layer.draw();
}

// Safety: Only run after the HTML is ready
document.addEventListener('DOMContentLoaded', initStudio);