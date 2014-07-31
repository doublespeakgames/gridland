define(['app/action/action'], function(Action) {
	
	var DURATION = 10000;
	var BURN_DAMAGE = 2;
	var BURN_DELAY = 200;
	
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
		this.timeout = setTimeout(function() {
			var delta = Math.sqrt(Math.pow(_this.target.p() - entity.absHeadPos.x, 2) + Math.pow(entity.absHeadPos.y, 2));
			var blast = G.make('fireBlast').css('width', (delta - 60) + 'px');
			entity.setPosture('aimOpen', 500);
			entity.getHead().append(blast);
			require('app/eventmanager').trigger('charge');
			setTimeout(function() {
				var explosion = G.make('fireBoom').css('transform', 'translateX(' + _this.target.p() + 'px)');
				G.addToWorld(explosion);
				explosion.css('left');
				explosion.addClass('exploded');
				setTimeout(function() {
					explosion.remove();
				}, 400);
				blast.remove();
				
				if(!_this.terminated) { entity.action = null; }
				
				_this.target.takeDamage(entity.getFireBlastDamage(), entity);
				var fireEffect = new (require('app/entity/worldeffect'))({ 
					effectClass: 'fire',
					spriteName: 'dragoneffects',
					row: 1,
					animationFrames: 4,
					effect: function() {
						fireEffect.lastBurn = fireEffect.lastBurn || 0;
						if(Math.abs(_this.target.p() - fireEffect.p()) < fireEffect.width() / 2 && fireEffect.lastBurn <  Date.now() - BURN_DELAY) {
							fireEffect.lastBurn = Date.now();
							require('app/eventmanager').trigger('burn');
							_this.target.takeDamage(BURN_DAMAGE, entity);
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
	
	FireBlast.prototype.terminateAction = function(entity) {
		this.terminated = true;
		clearTimeout(this.timeout);
		Action.prototype.terminateAction.call(this, entity);
	};

	return FireBlast;
});