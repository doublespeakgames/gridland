define(['jquery', 'app/engine', 'app/graphics', 'app/entity/tile'], function($, Engine, Graphics, Tile) {
	return {
		options : {
			rows : 8,
			columns : 8
		},
		init : function(opts) {
			$.extend(this.options, opts);
			Graphics.addToScreen(this);
			this.tiles = [];
			for (var i = 0; i < this.options.columns; i++) {
				this.tiles.push([]);
			}
		},

		el : function() {
			if (this._el == null) {
				this._el = Graphics.createBoard(this.options.rows, this.options.columns);
			}
			return this._el;
		},

		fill : function() {
			setTimeout(function() {
				require(['app/gameboard'], function(GameBoard) {
					GameBoard._doFill(0);
				});
			}, 100);
		},

		_doFill : function(num) {
			require(['app/gameboard', 'app/entity/tile'], function(GameBoard, Tile) {

				var row = 7 - Math.floor(num / GameBoard.options.columns);
				var col = Math.floor(num % GameBoard.options.rows);

				// console.log('[' + row + ', ' + col + ']');

				// Pieces to the left and the bottom could potetially be present
				var pCounts = {
					'grain' : 2,
					'wood' : 2,
					'stone' : 2
				};
				if (col > 0) {
					var sibling = GameBoard.tiles[col - 1][row];
					pCounts[sibling.options.type.className]--;
					if (col > 1 && GameBoard.tiles[col - 2][row].options.type.className == sibling.options.type.className) {
						// console.log('horizontal detection: ' + sibling.options.type.className + ' == ' + GameBoard.tiles[col - 2][row].options.type.className);
						pCounts[sibling.options.type.className]--;
					}
				}
				if (row < GameBoard.options.rows - 1) {
					var sibling = GameBoard.tiles[col][row + 1];
					pCounts[sibling.options.type.className]--;
					if (row < GameBoard.options.rows - 2 && GameBoard.tiles[col][row + 2].options.type.className == sibling.options.type.className) {
						// console.log('vertical detection: ' + sibling.options.type.className + ' == ' + GameBoard.tiles[col][row + 2].options.type.className);
						pCounts[sibling.options.type.className]--;
					}
				}
				var total = 0;
				for (tileClass in pCounts) {
					pCounts[tileClass] = pCounts[tileClass] < 0 ? 0 : pCounts[tileClass];
					total += pCounts[tileClass];
				}

				var baseline = 0;
				var r = Math.random();
				var theClass;
				for (tileClass in pCounts) {
					theClass = tileClass;
					var chance = pCounts[tileClass] / total;
					// console.log(tileClass + ': ' + r + ' < ' + baseline + ' + ' + pCounts[tileClass]  + ' / ' + total  + ' (' + chance + ')');
					if (r < baseline + chance) {
						break;
					}
					baseline += chance;
				}
				var type;
				for (t in Tile.TYPE) {
					if (Tile.TYPE[t].className == theClass) {
						type = Tile.TYPE[t];
						break;
					}
				}

				GameBoard.addTile(new Tile({
					type : type
				}), col);

				if (num < GameBoard.options.columns * GameBoard.options.rows - 1) {
					setTimeout(function() {
						require(['app/gameboard'], function(GameBoard) {
							GameBoard._doFill(num + 1);
						});
					}, 20);
				}
			});
		},

		addTile : function(tile, column) {
			var col = this.tiles[column];
			var finalRow = -1;
			while (finalRow < this.options.rows - 1 && col[finalRow + 1] == null) {
				finalRow++;
			}

			// Don't drop the tile if the column is full
			if (finalRow < 0) {
				throw "Cannot add tiles to full columns, idiot!";
			}
			require(['app/engine'], function(Engine) {
				Engine.bindTile(tile);
			});
			this.tiles[column][finalRow] = tile;
			tile.row = finalRow;
			tile.column = column;
			Graphics.setPositionInBoard(tile, -1, column);
			Graphics.addToTileContainer(tile);
			Graphics.dropTile(tile, finalRow, function() {
				// TODO: Lock input and don't check for matches while tiles are falling
			});
		},
		
		switchTiles: function(tile1, tile2) {
			Graphics.switchTiles(tile1, tile2, function(tile1, tile2) {
				require(['app/gameboard'], function(GameBoard) {
					var r1 = tile1.row, c1 = tile1.column;
					GameBoard.tiles[tile1.column][tile1.row] = tile2;
					GameBoard.tiles[tile2.column][tile2.row] = tile1;
					tile1.row = tile2.row;
					tile1.column = tile2.column;
					tile2.row = r1;
					tile2.column = c1;
					// TODO: Check for matches
				});
			});
		}
	};
});
