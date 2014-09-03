define(['app/action/action'], function(Action) {
	
	var Fireball = function(options) {
		if(options) {
			this.target = options.target;
		}
	};
	Fireball.prototype = new Action();
	Fireball.constructor = Fireball;
	
	Fireball.prototype.doAction = function(entity) {
		entity.setPosture('aim', 500);
		var _this = this;
		this.timeout = setTimeout(function() {
			var G = require('app/graphics/graphics');
			var angle = -entity.absHeadPos.r;
			var delta = -Math.sqrt(Math.pow(_this.target.p() - entity.absHeadPos.x, 2) + Math.pow(entity.absHeadPos.y, 2));
			entity.setPosture('shoot', 200);
			
			_this.projectile = G.make('dragonFireball').css({
				top: entity.absHeadPos.y,
				left: entity.absHeadPos.x,
				transform: 'rotate(' + angle + 'deg) translateX(0)'
			});
			G.addToWorld(_this.projectile);
			_this.projectile.css('left'); // Force redraw before animation
			_this.projectile.css('transform', 'rotate(' + angle + 'deg) translateX(' + delta + 'px)');
			require('app/eventmanager').trigger('shootFire');
			setTimeout(function() {
				_this.projectile.remove();
				var explosion = G.make('fireBoom').css('transform', 'translateX(' + _this.target.p() + 'px)');
				require('app/eventmanager').trigger('explodeFire');
				G.addToWorld(explosion);
				explosion.css('left');
				explosion.addClass('exploded');
				setTimeout(function() {
					explosion.remove();
				}, 400);
				if(!_this.terminated) { entity.action = null; }
				_this.target.takeDamage(entity.getFireballDamage(), entity);
			}, 300);
		}, 500);
	};
	
	Fireball.prototype.terminateAction = function(entity) {
		this.terminated = true;
		clearTimeout(this.timeout);
		Action.prototype.terminateAction.call(this, entity);
	};

	return Fireball;
});