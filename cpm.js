
// find and replace CPM with your initials (i.e. ABC)
// change this.name = "Your Chosen Name"

// only change code in selectAction function()

function CPM(game) {
    this.player = 1;
    this.radius = 10;
    this.rocks = 0;
    this.kills = 0;
    this.name = "Nicholas Mousel";
    this.color = "Orange";
    
    this.cooldown = 0;
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: 0, y: 0 };
    this.corners = [{x:0, y:0}, {x:800, y:0}, {x:0, y:800}, {x:800, y:800}]
};

CPM.prototype = new Entity();
CPM.prototype.constructor = CPM;

// alter the code in this function to create your agent
// you may check the state but do not change the state of these variables:
//    this.rocks
//    this.cooldown
//    this.x
//    this.y
//    this.velocity
//    this.game and any of its properties

// you may access a list of zombies from this.game.zombies
// you may access a list of rocks from this.game.rocks
// you may access a list of players from this.game.players

CPM.prototype.selectAction = function () 
{

    let action = { direction: { x: 0, y: 0 }, throwRock: false, target: null};
    let acceleration = 1000000;
    let closest = 250;
    let target = null;
    this.visualRadius = 500;

    for (let i = 0; i < this.game.zombies.length; ++i) {
        let ent = this.game.zombies[i];
        let dist = distance(ent, this);
        let multiplier = 1;
        if (dist < closest) {
            closest = dist;
            target = ent;
        }
        if (this.collide({x: ent.x, y: ent.y, radius: this.visualRadius})) {
            let difX = (ent.x - this.x) / dist;
            let difY = (ent.y - this.y) / dist;
            if (dist < 70)
            {
                // debugger;
                multiplier += 0.6;
            }

            if (this.rocks == 2 && closest > 150 && dist > 200)
            {
                        action.direction.x += difX * acceleration / (dist * dist);
                        action.direction.y += difY * acceleration / (dist * dist);
            }
            else
            {
                action.direction.x -= (difX * acceleration / (dist * dist)) * multiplier;
                action.direction.y -= (difY * acceleration / (dist * dist)) * multiplier;
            }
        }
    }
    // Corners suck
    for (let i = 0; i < 4; ++i) {
        if (this.collide({ x: this.corners[i].x, y: this.corners[i].y, radius: this.visualRadius * 0.3 })) {
            if (closest > 40)
            {
                // debugger
                let dist = distance(this, this.corners[i]);
                let difX = (this.corners[i].x - this.x) / dist;
                let difY = (this.corners[i].y - this.y) / dist;
                action.direction.x -= difX * acceleration / (dist * dist);
                action.direction.y -= difY * acceleration / (dist * dist);
            }
        }
    }
    let test = true;

    switch (this.rocks) {
        case 2:
            for (let i = 0; i < this.game.rocks.length; ++i)
            {
                let ent = this.game.rocks[i];
                if (!ent.removeFromWorld && test && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius * 0.8})) {
                    let dist = distance(this, ent);
                    if (dist > this.radius + ent.radius && dist > 40) {
                        let difX = (ent.x - this.x) / dist;
                        let difY = (ent.y - this.y) / dist;
                        action.direction.x += (difX * acceleration / (dist * dist)) * 0.5;
                        action.direction.y += (difY * acceleration / (dist * dist)) * 0.5;
                    }
                }
            }
            break;
        case 1:
            for (let i = 0; i < this.game.rocks.length; ++i)
            {
                let ent = this.game.rocks[i];
                if (!ent.removeFromWorld && test && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius * 1.5 })) {
                    let dist = distance(this, ent);
                        if (dist > this.radius + ent.radius) {
                            let difX = (ent.x - this.x) / dist;
                            let difY = (ent.y - this.y) / dist;
                            action.direction.x += (difX * acceleration / (dist * dist));
                            action.direction.y += (difY * acceleration / (dist * dist));
                        }

                }
            }
            break;

        default:
            for (let i = 0; i < this.game.rocks.length; ++i)
            {
                let ent = this.game.rocks[i];
                if (!ent.removeFromWorld && test && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius * 1.3 })) {
                    let dist = distance(this, ent);
                    if (dist > this.radius + ent.radius) {
                        let difX = (ent.x - this.x) / dist;
                        let difY = (ent.y - this.y) / dist;
                        action.direction.x += difX * acceleration / (dist * dist);
                        action.direction.y += difY * acceleration / (dist * dist);
                    }
                }
            }
            break;
    }

    if (target) {
        if (closest < 180)
        {
            action.target = this.calculateInterceptionPoint(target, target.velocity, 200);
            action.throwRock = action.target || false;
        }
    }
    return action;
};

// http://jaran.de/goodbits/2011/07/17/calculating-an-intercept-course-to-a-target-with-constant-direction-and-velocity-in-a-2-dimensional-plane/
CPM.prototype.calculateInterceptionPoint = function (target, targetVelocity, projSpeed) {
		let ox = target.x - this.x;
		let oy = target.y - this.y;
 
		let h1 = targetVelocity.x * targetVelocity.x + targetVelocity.y * targetVelocity.y - projSpeed * projSpeed;
		let h2 = ox * targetVelocity.x + oy * targetVelocity.y;
		let t;
		if (h1 == 0) { // problem collapses into a simple linear equation 
			t = -(ox * ox + oy * oy) / (2*h2);
		} else { // solve the quadratic equation
			let minusPHalf = -h2 / h1;
 
			let discriminant = minusPHalf * minusPHalf - (ox * ox + oy * oy) / h1; // term in brackets is h3
			if (discriminant < 0) { // no (real) solution then...
				return null;
			}
 
			let root = Math.sqrt(discriminant);
 
			let t1 = minusPHalf + root;
			let t2 = minusPHalf - root;
 
			let tMin = Math.min(t1, t2);
			let tMax = Math.max(t1, t2);
 
			t = tMin > 0 ? tMin : tMax; // get the smaller of the two times, unless it's negative
			if (t < 0) { // we don't want a solution in the past
				return null;
			}
		}
 
		// calculate the point of interception using the found intercept time and return it
		return { x: target.x + t * targetVelocity.x, y: target.y + t * targetVelocity.y};
}


// do not change code beyond this point

CPM.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

CPM.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

CPM.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

CPM.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

CPM.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

CPM.prototype.update = function () {
    Entity.prototype.update.call(this);
    // console.log(this.velocity);
    if (this.cooldown > 0) this.cooldown -= this.game.clockTick;
    if (this.cooldown < 0) this.cooldown = 0;
    this.action = this.selectAction();
    //if (this.cooldown > 0) console.log(this.action);
    this.velocity.x += this.action.direction.x;
    this.velocity.y += this.action.direction.y;

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            if (ent.name !== "Zombie" && ent.name !== "Rock") {
                var temp = { x: this.velocity.x, y: this.velocity.y };
                var dist = distance(this, ent);
                var delta = this.radius + ent.radius - dist;
                var difX = (this.x - ent.x) / dist;
                var difY = (this.y - ent.y) / dist;

                this.x += difX * delta / 2;
                this.y += difY * delta / 2;
                ent.x -= difX * delta / 2;
                ent.y -= difY * delta / 2;

                this.velocity.x = ent.velocity.x * friction;
                this.velocity.y = ent.velocity.y * friction;
                ent.velocity.x = temp.x * friction;
                ent.velocity.y = temp.y * friction;
                this.x += this.velocity.x * this.game.clockTick;
                this.y += this.velocity.y * this.game.clockTick;
                ent.x += ent.velocity.x * this.game.clockTick;
                ent.y += ent.velocity.y * this.game.clockTick;
            }
            if (ent.name === "Rock" && this.rocks < 2) {
                this.rocks++;
                ent.removeFromWorld = true;
            }
        }
    }
    

    if (this.cooldown === 0 && this.action.throwRock && this.rocks > 0) {
        this.cooldown = 1;
        this.rocks--;
        var target = this.action.target;
        var dir = direction(target, this);

        var rock = new Rock(this.game);
        rock.x = this.x + dir.x * (this.radius + rock.radius + 20);
        rock.y = this.y + dir.y * (this.radius + rock.radius + 20);
        rock.velocity.x = dir.x * rock.maxSpeed;
        rock.velocity.y = dir.y * rock.maxSpeed;
        rock.thrown = true;
        rock.thrower = this;
        this.game.addEntity(rock);
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

CPM.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
};