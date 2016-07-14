import React from 'react';

import * as Utils from '../../utils/utils.jsx';

let canvas = null;
let ctx = null;
let gradient = null;
let isPressed = [];
let ship = null;
let clouds = [];
let keys = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SPACE: 32
};

export default class NotFound404 extends React.Component {
    constructor(props) {
        super(props);

        this.goBack = this.goBack.bind(this);
    }

    goBack(e, path) {
        const pathName = path || '/';
        Utils.handleLink(e, pathName);
    }

    componentDidMount() {
        init();
    }

    render() {
        const {title} = this.props.location.query;
        const {message} = this.props.location.query;
        const {linkMessage} = this.props.location.query;
        let {link} = this.props.location.query;
        return (
            <div className='container-error'>
                <div className='dialog-notify'>
                    <h2>404</h2>
                    <span className='page-not-found'>{title || 'Página no encontrada'}</span>
                    <span className='error-message'>{message}</span>
                    <a
                        className='back-link-error pointer'
                        onClick={(e) => {
                            this.goBack(e, link);
                        }}
                    >
                        {linkMessage || 'Regresar a Manager'}
                    </a>
                </div>
                <canvas id='canvas'></canvas>
            </div>
        );
    }
}

NotFound404.propTypes = {
    location: React.PropTypes.object
};

class ZBoxShip {
    constructor(x, y, size) {
        this.x = x || (window.innerWidth / 2);
        this.y = y || (window.innerHeight / 2);
        this.w = 10;
        this.h = this.w;
        this.color = '#E2E2E2';
        this.icon = '\uf1d8';
        this.speed = 5;
        this.size = size || 50;
        this.frames = 0;
        this._jump = 4.6;
        this.velocity = 0;
    }

    render(ctx) {
        this.gravity = 0.25;
        if (!ctx) {
            return null;
        }

        ctx.save();
        ctx.font = this.size + 'px Fontawesome';
        var sizeOfShip = ctx.measureText(this.icon);
        this.w = this.h = sizeOfShip.width;
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(45 * Math.PI / 180);
        ctx.translate(-this.x - (this.w / 2), -this.y + (this.h / 2));
        ctx.fillStyle = '#A8A8A8';
        ctx.fillText('\uf1d9', this.x, this.y);
        ctx.fillStyle = this.color;
        ctx.fillText(this.icon, this.x, this.y);
        ctx.restore();
        this.frames++;
    }

    setPosition(x, y) {
        this.x += x || 0;
        this.y += y || 0;
    }

    moveWave() {
        const cos = Math.cos(this.y / 100) * 10;
        this.y += cos;
    }

    jump() {
        this.velocity = -this._jump;
    }

    applyGravity() {
        this.velocity += this.gravity;
        this.y += this.velocity;
    }
}

class Cloud {
    constructor(x, y, opacity, size) {
        this.x = x || 0;
        this.y = y || 0;
        this.opacity = opacity || 1;
        this.color = 'rgba(255, 255, 255, ' + this.opacity + ')';
        this.w = 40;
        this.icon = '\uf0c2';
        this.size = size || 10;
        this.speed = {
            x: -0.9,
            y: 0
        };
    }

    render(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.font = this.size + 'px Fontawesome';
        var sizeOfText = ctx.measureText(this.icon);
        this.w = sizeOfText.width;
        ctx.fillText(this.icon, this.x, this.y);
        ctx.restore();
    }

    move() {
        this.x += this.speed.x;
        this.y += this.speed.y;
    }

    recycleClouds() {
        if ((this.x + this.w) < 0) {
            var posX = randomize(canvas.width + 250, canvas.width);
            this.x = posX;
        }
    }

    setSpeed(speed) {
        this.speed.x = speed.x || this.speed.x;
        this.speed.y = speed.y || this.speed.y;
    }
}

function init() {
    canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');
    gradient = ctx.createLinearGradient(0, 0, 0, canvas.width);
    gradient.addColorStop(0, '#90dffe');
    gradient.addColorStop(0.5, '#fff');
    gradient.addColorStop(1, '#fff');
    ship = new ZBoxShip(null, null, 55);
    initClouds();

    gameloop();
    listeners();
}

function listeners() {
    document.addEventListener('keydown', (e) => {
        var key = e.keyCode || e.which;
        isPressed[key] = true;
    }, false);

    document.addEventListener('keyup', (e) => {
        var key = e.keyCode || e.which;
        isPressed[key] = false;
    }, false);
}

function gameloop() {
    requestAnimationFrame(gameloop);
    renderer();
    actions();
}

function renderer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    clouds.forEach((cloud) => {
        cloud.render(ctx);
    });
    ship.render(ctx);
}

function actions() {
    if (isPressed[keys.LEFT]) {
        ship.setPosition(-ship.speed);
    }

    if (isPressed[keys.UP]) {
        ship.setPosition(null, -ship.speed);
    }

    if (isPressed[keys.RIGHT]) {
        ship.setPosition(ship.speed);
    }

    if (isPressed[keys.DOWN]) {
        ship.setPosition(null, ship.speed);
    }

    if (isPressed[keys.SPACE]) {
        ship.jump();
    }

    clouds.forEach((cloud) => {
        cloud.move();
        cloud.recycleClouds();
    });
}

function initClouds() {
    for (var i = 0; i < 40; i++) {
        var posX = randomize(canvas.width, canvas.width / 2);
        var posY = randomize(canvas.height, 0);
        var opacity = randomize(1, 0.4, true);
        var speedX = randomize(1.1, 0.5, true);
        var size = randomize(100, 45);
        var zboxCloud = new Cloud(posX, posY, opacity, size);
        zboxCloud.setSpeed({x: -speedX});
        clouds.push(zboxCloud);
    }
}

function randomize(max, min, isFloat) {
    var random = Math.random() * (max - min) + min;
    if (!isFloat) {
        random = Math.floor(random);
    }
    return random;
}

window.requestAnimationFrame = (function requestAnimationFrame() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function fallback(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
}());
