'use strict';

var icons = {
  blank: 'http://i.imgur.com/HM1e3Tbb.jpg',
  pressed: 'http://i.imgur.com/bGT8xGEb.jpg',
  exposedBomb: 'http://i.imgur.com/pTJ8Swhb.jpg',
  explodedBomb: 'http://i.imgur.com/UFmXprFb.jpg',
  flag: 'http://i.imgur.com/nLPvW15b.jpg',
  // Index is # of adjacent bombs
  bombs: [
    'http://i.imgur.com/Flqdqi1b.jpg', // 0
    'http://i.imgur.com/bM8oExob.jpg', // 1
    'http://i.imgur.com/bQKSbqYb.jpg', // 2
    'http://i.imgur.com/5jNcEeVb.jpg', // 3
    'http://i.imgur.com/BnxjHgHb.jpg', // 4
    'http://i.imgur.com/RaFrMYcb.jpg', // 5
    'http://i.imgur.com/GlwQOy0b.jpg', // 6
    'http://i.imgur.com/8ngsVa8b.jpg', // 7
    'http://i.imgur.com/lJ8P1wab.jpg'  // 8
  ]
};

/**
 * Represents a Minesweeper tile
 * @param {integer} x the current x location of the tile
 * @param {integer} y the current y location of the tile
 * @param {boolean} bomb true if the tile is a bomb, 
 * false otherwise
 * @constructor
 */
function Tile(x, y, bomb) {
  if (this instanceof Tile) {
    this.x = x;
    this.y = y;
    this.pressed = false;
    this.flag = false;
    this.bomb = bomb;
    this.showBomb = false;
    this.number = null;
  } else {
    var obj = new Tile();
    var ret = Tile.apply(obj, arguments);
    return ret === undefined ? obj : ret;
  }
}

/**
 * Returns the encoded id selector for a tile
 * used when generating html but can also be used
 * by jQuery to select the tile by id
 * @return {string}
 */
Tile.prototype.id = function id() {
  return 'tile_' + this.x + '_' + this.y;
};

/**
 * Returns the tile's generated html
 * Used to render a tile
 * @return {string}
 */
Tile.prototype.html = function html() {
  var imageURL = '';
  if (this.number !== null) {
    imageURL = icons.bombs[this.number];
  } else if (this.flag === true) {
    imageURL = icons.flag;
  } else if (this.pressed && this.showBomb) {
    imageURL = icons.explodedBomb;
  } else if (this.showBomb) {
    imageURL = icons.exposedBomb;
  } else if (this.pressed) {
    imageURL = icons.pressed;
  } else {
    imageURL = icons.blank;
  }
  
  return '<img id="' + this.id() + '" src="' + imageURL + '" alt="Tile" width="20" height="20"/>';
};

/**
 * Returns an integer between min and max
 * @param {integer} min
 * @param {integer} max
 * @return {integer} random number between min and max
 */
function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Represents a Minesweeper board
 * @param {integer} size the width and height of the board
 * @param {integer} bombs the number of bombs to place 
 * @constructor
 */
function Board(size, bombs, cssSelector) {
  if (this instanceof Board) {
    this.size = size;
    this.board = [];
    this.cssSelector = cssSelector;

    // populate board with blanks
    for (var i = 0; i < size; i++) {
      var row = [];
      for (var j = 0; j < size; j++) {
        row.push(new Tile(i, j, false));
      }
      this.board.push(row);
    }

    var currBombs = bombs;
    // set the bombs by picking random row and random column
    while (currBombs > 0) {
      var randomRow = randomRange(0, size);
      var randomCol = randomRange(0, size);
      var randomTile = this.board[randomRow][randomCol];
      if (randomTile.bomb === false) {
        randomTile.bomb = true;
        currBombs--;
      }
    }

    this.render();
  } else {
    var obj = new Board();
    var ret = Board.apply(obj, arguments);
    return ret === undefined ? obj : ret;
  }
}

/**
 * Returns an array of adjacent tiles
 * @param {integer} x
 * @param {integer} y
 * @return {Array.<Tile>}
 */
Board.prototype._adjacentTiles = function _adjacentTiles(x, y) {
  var that = this;
  
  var possiblePoints = [[x, y + 1],
                        [x + 1, y],
                        [x, y - 1],
                        [x - 1, y],
                        [x + 1, y + 1],
                        [x - 1, y - 1],
                        [x + 1, y - 1],
                        [x - 1, y + 1]];
  
  return possiblePoints.filter(function(point) {
    var x = point[0];
    var y = point[1];
    
    if (x < 0 || x >= that.size || y < 0 || y >= that.size) {
      return false;
    }
    
    return true;
  }).map(function (point) {
    var x = point[0];
    var y = point[1];
    return that.board[x][y];
  });
};

/**
 * Returns the number of adjacent bombs
 * @param {integer} x
 * @param {integer} y
 * @return {integer}
 */
Board.prototype._adjacentBombs = function _adjacentBombs(x, y) {
  var tiles = this._adjacentTiles(x, y);
  var adjacentBombs = 0;
  for (var i = 0; i < tiles.length; i++) {
    if (tiles[i].bomb === true) {
      adjacentBombs++;
    }
  }
  return adjacentBombs;
};

/**
 * Toggles tile flag
 * @param {integer} x
 * @param {integer} y
 */
Board.prototype.flagTile = function flagTile(x, y) {
  var tile = this.board[x][y];
  tile.flag = !tile.flag;
  this.render();
};

/**
 * Tile pressing helper function
 * @param {integer} x
 * @param {integer} y
 * @param {Dictionary.<string, boolean>} previousTiles
 */
Board.prototype._pressTileHelper = function _pressTileHelper(x, y) {
  // check if tile is a bomb
  var tile = this.board[x][y];
  tile.pressed = true;
  if (tile.flag === true) {
    tile.flag = false;
  }
  if (tile.bomb === true) {
    tile.showBomb = true;
    // if it is, game over, show all of the other bombs
    for (var i = 0; i < this.size; i++) {
      for (var j = 0; j < this.size; j++) {
        var otherTile = this.board[i][j];
        
        otherTile.flag = false;
        if (otherTile.bomb === true) {
          otherTile.showBomb = true;
        }
      }
    }
    return;
  }
  
  // otherwise calculate how many adjacent bombs
  var adjacentTiles = this._adjacentTiles(x, y);
  var adjacentBombs = this._adjacentBombs(x, y);
  if (adjacentBombs === 0) {
    // if no adjacent bombs, recursively call pressTile on all adjacent tiles
    for (var adjTileIndex = 0; adjTileIndex < adjacentTiles.length; adjTileIndex++) {
      var adjTile = adjacentTiles[adjTileIndex];
      if (adjTile.pressed === false) {
        this._pressTileHelper(adjTile.x, adjTile.y);
      }
    }
  } else {
    tile.number = adjacentBombs;
  }
};

/**
 * Main function for pressing a tile
 * Calls helper function, then rerenders after it finishes recursing
 * @param {integer} x
 * @param {integer} y
 */
Board.prototype.pressTile = function pressTile(x, y) {
  this._pressTileHelper(x, y);
  this.render();
};

/**
 * Renders a Minesweeper board using jQuery
 */
Board.prototype.render = function render() {
  var that = this;
  
  // clear all elements in the Board
  $(this.cssSelector).empty();

  // redraw state
  for (var row = 0; row < this.size; row++) {
    var rowId = "row" + row;
    $(this.cssSelector).append('<div class="floated" id="' + rowId + '"></div>');
    for (var col = 0; col < this.size; col++) {
      (function(row, col) {
        var tile = that.board[row][col];
        $('#' + rowId).append(tile.html());

        // handle mouse events
        $('#' + tile.id()).mousedown(function(event) {
          switch (event.which) {
            case 1: // left mouse click
              that.pressTile.call(that, row, col);
              break;
            case 3: // right mouse click
              that.flagTile.call(that, row, col);
              break;
            default:
              break;
          }
        });
      })(row, col);
    }
  }
};
