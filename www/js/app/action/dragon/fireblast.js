define(['app/action/action'], function(Action) {
	
	var DURATION = 10000;
	var BURN_DAMAGE = 1;
	
	var FireBlast = function(options) {
		if(options) {
			this.target = options.target;
		}
	};
	FireBlast.prototype = new Action();
	FireBlast.constructor = FireBlast;
	
	FireBlast.prototype.doAction = function(entity) {
		var G = require('app/graphics/graphics');
		entity.setPosture('aimClose', 100);
		var _this = this;
		setTimeout(function() {
			var delta = Math.sqrt(Math.pow(_this.target.p() - entity.absHeadPos.x, 2) + Math.pow(entity.absHeadPos.y, 2));
			var blast = G.make('fireBlast').css('width', (delta - 60) + 'px');
			entity.setPosture('aimOpen', 500);
			entity.getHead().append(blast);
			setTimeout(function() {
				var explosion = G.make('fireBoom').css('transform', 'translateX(' + _this.target.p() + 'px)');
				G.addToWorld(explosion);
				explosion.css('left');
				explosion.addClass('exploded');
				setTimeout(function() {
					explosion.remove();
				}, 400);
				blast.remove();
				entity.action = null;
				
				_this.target.takeDamage(entity.getFireBlastDamage());
				var fireEffect = new (require('app/entity/worldeffect'))({ 
					effectClass: 'fire',
					row: 1,
					animationFrames: 4,
					effect: function() {
						if(Math.abs(_this.target.p() - fireEffect.p()) < fireEffect.width() / 2 ) {
							_this.target.takeDamage(BURN_DAMAGE);
							if(require('app/world').hasEffect('frozen')) {
								require('app/eventmanager').trigger('endStateEffect', 
										[require('app/gamecontent').StateEffects.frozen]);
							}
						} 
					}
				});
				fireEffect.p(_this.target.p());
				require('app/eventmanager').trigger('newEntity', [fireEffect]);
				setTimeout(function() {
					require('app/eventmanager').trigger('removeEntity', [fireEffect]);
				}, DURATION);
			}, 1000);
		}, 100);
	};

	return FireBlast;
});