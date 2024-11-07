class EventEmitter {
    constructor () {
        this.listeners = [];
    }

    on = (name, callback) => {
        this.listeners.push({ name, callback });

        return () => {
            this.listeners = this.listeners.filter(($) => $.callback !== callback);
        };
    };

    emit = (name, data) => {
        this.listeners.forEach((listener) => {
            if (listener.name === name) {
                listener.callback(data);
            }
        });
    };
}

const game = new EventEmitter();

document.addEventListener('DOMContentLoaded' , () => {
    const bird = document.querySelector('.bird')
    const gameDisplay = document.querySelector('.game-container')
    const ground = document.querySelector('.ground-moving')

    const JUMP_VELOCITY = 6;

    let birdLeft = 220;
    let birdBottom = 100;
    let gravity = -.2;
    let isGameOver = false;
    let gap = 530;
    let velocity = 0;
    let speed = 3;

    function draw() {
        birdBottom += velocity;
        velocity += gravity;
        bird.style.bottom = birdBottom + 'px'
        bird.style.left = birdLeft + 'px'
        bird.style.transform = `rotate(${-velocity * 3}deg)`;
    }

    let gameTimerId = setInterval(draw, 20)

    function control(e) {
        if (e.keyCode === 32) {
            jump()
        }
    }

    function jump() {
        velocity = JUMP_VELOCITY;
        // if (birdBottom < 500) birdBottom += 50
        bird.style.bottom = birdBottom + 'px'
        console.log(birdBottom)
    }
    document.addEventListener('keyup', control)


    function generateObstacle() {
        let obstacleLeft = 500
        let randomHeight = Math.random() * 60
        let obstacleBottom = randomHeight
        const obstacle = document.createElement('div')
        const topObstacle = document.createElement('div')
        if (!isGameOver) {
            obstacle.classList.add('obstacle')
            topObstacle.classList.add('topObstacle')
        }
        gameDisplay.appendChild(obstacle)
        gameDisplay.appendChild(topObstacle)
        obstacle.style.left = obstacleLeft + 'px'
        topObstacle.style.left = obstacleLeft + 'px'
        obstacle.style.bottom = obstacleBottom + 'px'
        topObstacle.style.bottom = obstacleBottom + gap + 'px';

        let scored = false;

        function moveObstacle() {
            obstacleLeft -= speed;
            obstacle.style.left = obstacleLeft + 'px'
            topObstacle.style.left = obstacleLeft + 'px'

            if (obstacleLeft === -60) {
                clearInterval(timerId)
                gameDisplay.removeChild(obstacle)
                gameDisplay.removeChild(topObstacle)
            }

            if (obstacleLeft > 220 && !scored) {
                if (!window.__dead) {
                    game.emit('score');
                    scored = true;
                }
            }

            if (obstacleLeft > 200 && obstacleLeft < 280) {
                if ((birdBottom < obstacleBottom + 153 || birdBottom > obstacleBottom + gap - 200) || birdBottom < 0) {
                    gameOver();
                    clearInterval(timerId);

                    if (!window.__dead) {
                        game.emit('death');
                        window.__dead = true;
                    }
                } 
            }
        }

        let timerId = setInterval(moveObstacle, 20);
        if (!isGameOver) setTimeout(generateObstacle, Math.random() * 1000 + 1000);
    }

    generateObstacle()

    function gameOver() {
        clearInterval(gameTimerId)
        console.log('game over')
        isGameOver = true
        document.removeEventListener('keyup', control)
        ground.classList.add('ground')
        ground.classList.remove('ground-moving')
    }
});

game.on('death', () => {
    const image = document.createElement('img');

    image.src = 'you-died.jpg';
    image.style.width = '100%';
    image.style.height = '100%';

    image.style.position = 'fixed';
    image.style.left = '0';
    image.style.top = '0';

    image.style.zIndex = 100;

    document.body.appendChild(image);

    const audio = new Audio('/you-died.mp3');

    audio.play();
});


let score = -1;

game.on('score', () => {
    score += 1;

    if (score % 3 === 0) {
        playAudio('/horn.mp3');
    } else {
        playAudio('/coin.mp3');
    }
});

const playAudio = (src) => {
    const audio = new Audio(src);

    audio.play();
};

const GIFS = [
    { src: 'crab.gif', width: '300px' },
    { src: 'frog.gif', width: '300px' },
    { src: 'snoop.gif', width: '200px' },
    { src: 'fire.gif', width: '200px' },
    { src: 'one.gif', width: '300px' },
    { src: 'two.gif', width: '300px' },
    { src: 'three.gif', width: '300px' },
];

game.on('score', () => {
    if (Math.random() > .5 && score > 0) {
        const image = document.createElement('img');

        const { src, width } = GIFS[Math.floor(Math.random() * GIFS.length)];

        image.src = src;
        image.style.width = width;
    
        image.style.position = 'fixed';
        image.style.left = Math.random() * 1000 + 'px';
        image.style.top = Math.random() * 500 + 'px';
    
        image.style.zIndex = 100;
    
        document.body.appendChild(image);
    }
});

let isMusicOn = false;

game.on('score', () => {
    if (Math.random() > .5 && !isMusicOn && score > 5) {
        const audio = new Audio('music.mp3');

        audio.play();

        isMusicOn = true;
    }
});
