class Player {
  static barWidth = 5;
  static barHeight = 80;

  constructor(player, x, y, wins, score, speed) {
    this.player = player;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.score = score;
    this.wins = wins;
  }
  // generate players on first game rendering
  init = (ctx) => {
    ctx.fillStyle = "#fff";

    if (this.player === "player") {
      ctx.fillRect(this.x, this.y, Player.barWidth, Player.barHeight);
    } else {
      ctx.fillRect(this.x, this.y, Player.barWidth, Player.barHeight);
    }
  };
  // move COM up when ball goes up
  moveUp = () => {
    this.y -= this.speed;
  };
  // move COM down when ball goes down
  moveDown = () => {
    this.y += this.speed;
  };
  // choose whether to go up or down based on ball direction(for COM)
  pickDirection = (ball) => {
    if (ball.y < this.y + Player.barHeight / 2 ) {
      this.moveUp();
    }
    if (ball.y > this.y + Player.barHeight / 2) {
      this.moveDown();
    }
  };
}

class Ball {
  static size = 8;
  static speedUp = 1.5;
  static ballDirections = {
    side: ["right", "left"],
    upDown: ["up", "down"],
  };

  constructor(x, y, direction, speed = 2.25) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = speed;
  }

  moveSide = () => {
    if (this.direction.side === "right") {
      this.x = this.x + this.speed;
    } else if (this.direction.side === "left") {
      this.x = this.x - this.speed;
    }
  };

  moveUpDown = () => {
    if (this.direction.upDown === "up") {
      this.y = this.y - this.speed;
    } else if (this.direction.upDown === "down") {
      this.y = this.y + this.speed;
    }
  };

  moveBall = () => {
    this.moveSide();
    this.moveUpDown();
  };
}

class Game {
  static levels = ["#3cc35b", "#252074", "#d55c10"];

  constructor() {
    this.cvs = document.getElementById("canvas");
    this.ctx = this.cvs.getContext("2d");
    this.level = 1;
    this.round = 1;
    this.players = null;
    this.ball = {};
    this.animateId = null;
    this.gameOn = false;
    this.winner = null;
  }

  init = () => {
    this.createBall();
    this.createPlayers();
    this.drawGame();

    !this.gameOn && this.gameText(this.winner);
  };

  gameText = (winner) => {
    // generate center text
    this.ctx.fillStyle = "#000";
    this.ctx.font = "24px prompt, sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      `${winner || "press enter to start game"}`.toUpperCase(),
      this.cvs.width / 2,
      this.cvs.height / 2
    );
  };

  generateBoard = () => {
    // generate tennis field bg based on current lvl
    this.ctx.fillStyle = Game.levels[this.level - 1];
    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
    this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);

    // generate center bar
    const barWidth = 5;
    const barHeight = this.cvs.height * 0.95;
    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(
      Math.floor(this.cvs.width / 2) - barWidth / 2,
      this.cvs.height * 0.025,
      barWidth,
      barHeight
    );
  };

  createBall = () => {
    // possible number of sides and directions for a ball to take
    const nbrOfSides = Ball.ballDirections.side.length;
    const nbrOfDirs = Ball.ballDirections.upDown.length;

    // choose a random side for the ball
    const side =
      this.ball?.direction?.side ||
      Ball.ballDirections.side[randomNum(nbrOfSides)];
    // choose a random direction for the ball
    const upDown = Ball.ballDirections.upDown[randomNum(nbrOfDirs)];

    // create instance of Ball object
    this.ball = new Ball(
      this.cvs.width / 2,
      this.cvs.height / 2,
      { side, upDown },
      this.ball.speed
    );
  };

  createPlayers = () => {
    // create nbr of players inside game
    let playersData = [];
    for (let i = 0; i < 2; i++) {
      const player = {
        player: i < 1 ? "player" : "com",
        posX: i < 1 ? 20 : this.cvs.width - 20,
        posY: this.cvs.height / 2 - Player.barHeight / 2,
        speed: i < 1 ? this.ball.speed * 1.2 : this.ball.speed * 0.85,
        wins: this.players ? this.players[i].wins : 0,
        score: this.players ? this.players[i].score : 0,
      };
      playersData.push(player);
    }

    // initilize players prop with empty array
    this.players = [];

    // initialize players objs inside game
    playersData.forEach((playerInfo) => {
      const { player, posX, posY, wins, score, speed } = playerInfo;
      this.players.push(new Player(player, posX, posY, wins, score, speed));
    });
  };

  generateScore = () => {
    // generate round and current game level
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "18px prompt, sans-serif";
    this.ctx.textAlign = "end";

    this.ctx.fillText(
      `Round ${this.round}`,
      this.cvs.width - 30,
      this.cvs.height - 25
    );

    this.ctx.font = "15px prompt, sans-serif";
    this.ctx.fillText(
      `level ${this.level}`,
      this.cvs.width - 30,
      this.cvs.height - 10
    );

    this.ctx.textAlign = "center";
    this.ctx.font = "28px promp, sans-serif";

    // generate each player's score
    this.players.forEach((playerObj) => {
      const x = playerObj.player === "player" ? -35 : 35;
      this.ctx.fillText(
        playerObj.score,
        this.cvs.width / 2 + x,
        this.cvs.height - 25
      );
    });
  };

  generateBall = () => {
    // Generate ball on board
    this.ctx.fillStyle = "#fff";
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, Ball.size, 0, Math.PI * 2);
    this.ctx.fill();
  };

  generatePlayers = (ctx) => {
    // generate players on board
    this.players.forEach((player) => {
      player.init(ctx);
    });
  };

  // generate game's whole features
  drawGame = () => {
    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
    this.generateBoard();
    this.generateScore();
    this.generatePlayers(this.ctx);
    this.generateBall();
  };

  // generate game's animation frame on game start
  startGame = () => {
    requestAnimationFrame(this.animate);
  };

  // generate game frame on every progress
  animate = () => {
    this.playerBallCrash();
    this.handleWallCrush();
    this.ball.moveBall();

    this.players[1].pickDirection(this.ball);

    this.playerReachEnd();
    this.drawGame();

    this.animateId = requestAnimationFrame(this.animate);

    this.setNewRound();
  };

  // handle ball colliding against top and bottom ends of board
  handleWallCrush = () => {
    if (this.ball.y + Ball.size / 3 >= this.cvs.height) {
      this.ball.direction.upDown = "up";
    } else if (this.ball.y - Ball.size / 3 <= 0) {
      this.ball.direction.upDown = "down";
    }
  };

  // handle player and ball crush for both player & com
  playerBallCrash = () => {
    let {
      x: ballX,
      y: ballY,
      direction: { upDown: downUp },
    } = this.ball;

    this.players.forEach(playerObj => {
      const { x: plyX, y: plyY, player } = playerObj;
      let upDown = null,
        side = null;

      if (ballY >= plyY && ballY <= plyY + Player.barHeight) {
        if (downUp === "up") {
          upDown = "up";
        } else {
          upDown = "down";
        }
      }
      if (
        player === "com" &&
        ballX >= plyX &&
        ballX <= plyX + Player.barWidth
      ) {
        side = "left";
      } else if (
        player === "player" &&
        ballX <= plyX + Player.barWidth &&
        ballX >= plyX
      ) {
        side = "right";
      }
      if (upDown && side) {
        this.ball.direction = { side, upDown };
      }
    });
  };

  // set new round once ball passes through both paddles Or new game if previous one finishes
  setNewRound = () => {
    const { x: ballX } = this.ball;
    let timeLapse = 1

    if (
      ballX + Ball.size / 2 < -100 ||
      ballX - Ball.size / 2 > this.cvs.width + 100
    ) {
      cancelAnimationFrame(this.animateId);
      window.onkeydown = null;
      this.updateScores();
      this.checkWinner();
      this.init();

      timeLapse = this.gameOn ? timeLapse : timeLapse * 3.5;
      setTimeout(() => {
        if (this.gameOn)  {
          window.onkeydown = (e) => movePlayer(e, this.players[0]);
          this.startGame();
          timeLapse += 2
        } else {
          this.resetGame();
        }
      }, 1000 * timeLapse);
    }
  };

  // update game score for both player & com
  updateScores = () => {
    const { x: BallX } = this.ball;
    this.players.forEach((playerObj) => {
      const { player } = playerObj;
      if (player === "player" && BallX < 0) {
        this.players[1].score++;
        this.ball.direction.side = "left";
      } else if (player === "com" && BallX > this.cvs.width) {
        this.players[0].score++;
        this.ball.direction.side = "right";
      }
    });

    this.round++;

    for (let i = this.players.length - 1; i > 0; i--) {
      const { score: comScore } = this.players[i];
      const { score: plScore } = this.players[i - 1];

      if (comScore + 3 === plScore || plScore + 3 === comScore) {
        if (comScore + 3 === plScore) {
          this.players[i - 1].wins++;
          this.ball.direction.side = "left";
        } else {
          this.players[i].wins++;
          this.ball.direction.side = "right";
        }

        if (this.players[i].wins !== 2 && this.players[i - 1].wins != 2) {
          this.players[i].score = 0;
          this.players[i - 1].score = 0;
          this.round = 1;
          this.ball.speed *= Ball.speedUp;
          this.level++;
        } else this.round--;
      }
    }
  };

  // stop both players moving further on each board's vertical ends
  playerReachEnd = () => {
    this.players.forEach((player) => {
      if (player.y + Player.barHeight > this.cvs.height) {
        player.y = this.cvs.height - Player.barHeight;
      } else if (player.y < 0) {
        player.y = 0;
      }
    });
  };

  // display winner if one player first wins 2 games(levels)
  checkWinner = () => {
    const dispWinner = this.players.reduce((player, com) => {
      if (player.wins === 2) return `You Win!`;
      if (com.wins === 2) return `You Lose!`;
      return null;
    });

    if (dispWinner) {
      this.winner = dispWinner;
      this.gameOn = this.winner ? false : true;
    }
  };

  //set a new game
  resetGame = () => {
    this.level = 1;
    this.round = 1;
    this.players = null;
    this.ball = {};
    this.animateId = null;
    this.winner = null;

    this.init();
    runGame(this);
  };
}
// generate a random num between 0 & a specified number argument
const randomNum = (length) => {
  return Math.floor(Math.random() * length);
};

const movePlayer = (event, player) => {
  switch (event.key) {
    case "ArrowUp":
      player.moveUp();
      break;
    case "ArrowDown":
      player.moveDown();
      break;
    default:
      null;
  }
};

const runGame = (game) => {
  window.onkeyup = (e) => {
    if (e.key === "Enter") {
      e.currentTarget.onkeydown = (e) => movePlayer(e, game.players[0]);
      game.gameOn = true;
      game.startGame();
      e.currentTarget.onkeyup = null;
    }
  };
};

const g = new Game();
g.init();
runGame(g);