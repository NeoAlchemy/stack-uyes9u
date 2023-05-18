import {
  canvas,
  ctx,
  GameObject,
  Group,
  InputController,
  Scene,
  Game,
} from './pico-planet';

// Import stylesheets
import './style.css';

/* -------------------------------------------------------------------------- */
/*                               GAME SPECIFIC CODE                           */
/* -------------------------------------------------------------------------- */

/* ------------------------------ GAME MECHANICS ---------------------------- */
const COLOR_BACKGROUND: string = '#000';
const COLOR_TILE: string = '#0F4';
const COLOR_STATIC_TILE: string = '#F40';
const TILE_WIDTH: number = 100;
const TILE_HEIGHT: number = 10;
const SPEED: number = 2;

/* --------------------------------- ENTITIES ------------------------------- */
class Tile extends GameObject {
  // initial state
  constructor(_x: number, _y: number, _width?: number, _height?: number) {
    super(new TouchController());
    this.width = _width ? _width : TILE_WIDTH;
    this.height = _height ? _height : TILE_HEIGHT;
    this.x = _y;
    this.y = _x;
    this.command = 'RTL';
  }

  // update the state
  update() {
    super.update();

    // animate
    if (this.command == 'RTL') this.x = this.x + SPEED * 1;
    else if (this.command == 'LTR') this.x = this.x - SPEED * 1;
  }

  // display the results of state
  render() {
    super.render();

    ctx.fillStyle = COLOR_TILE;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  switchDirection() {
    this.command = this.command == 'RTL' ? 'LTR' : 'RTL';
  }
}

class StaticTile extends GameObject {
  // initial state
  constructor(_x: number, _y: number, _width: number, _height: number) {
    super();
    this.width = _width;
    this.height = _height;
    this.x = _x;
    this.y = _y;
  }

  // update the state
  update() {
    super.update();
  }

  // display the results of state
  render() {
    super.render();

    ctx.fillStyle = COLOR_STATIC_TILE;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Stack extends Group {
  // initial state
  constructor() {
    super();

    let firstStaticTile = new StaticTile(
      canvas.width / 2 - TILE_WIDTH / 2,
      canvas.height - TILE_HEIGHT,
      TILE_WIDTH,
      TILE_HEIGHT
    );
    this.children.push(firstStaticTile);
  }

  // update the state
  update() {
    super.update();
  }

  // display the results of state
  render() {
    super.render();
  }
}

/* ------------------------------- InputController  ----------------------------- */

class TouchController extends InputController {
  clicked: boolean = false;

  constructor() {
    super();

    document.addEventListener(
      'mousedown',
      (evt) => {
        this.clicked = true;
      },
      false
    );
    document.addEventListener(
      'mouseup',
      (evt) => {
        this.clicked = false;
      },
      false
    );
  }

  update(gameObject: GameObject) {
    if (this.clicked) gameObject.command = 'STOP';
  }
}

/* ----------------------------------- SCENE --------------------------------- */
class MainLevel extends Scene {
  private tile: Tile;
  private stack: Stack;

  constructor() {
    super();
  }

  create() {
    this.stack = new Stack();
    this.add(this.stack);

    this.tile = new Tile(this.stack.children[0].y - TILE_HEIGHT, 0);
    this.add(this.tile);

    this.physics.onCollideWalls(
      this.tile,
      this.tile.switchDirection,
      this.tile
    );
  }

  update() {
    super.update();

    this.onActiveTileStopped();
  }

  render() {
    super.render();
  }

  onActiveTileStopped() {
    if (this.tile.command == 'STOP' && this.isTileStackable()) {
      // get previous tile
      let stackCount = this.stack.children.length;
      let prevTile = this.stack.children[stackCount - 1];

      //default the width and x location
      let width = prevTile.width;
      let x = this.tile.x;

      if (this.tile.x > prevTile.x) {
        // tile is to the right of the prev tile
        width = prevTile.x + prevTile.width - this.tile.x;
      } else if (this.tile.x + this.tile.width < prevTile.x + prevTile.width) {
        // tile is to the left of prev tile
        width = prevTile.width - (prevTile.x - this.tile.x);
        x = prevTile.x;
      }

      // add new static tile
      this.stack.children.push(
        new StaticTile(x, this.tile.y, width, this.tile.height)
      );
      // add new tile above
      this.newTile(width);
    } else if (this.tile.command == 'STOP' && !this.isTileStackable()) {
      // tile stopped and is not stackable
      new Game(new MainLevel());
    }
  }

  isTileStackable() {
    // find prev tile
    let stackCount = this.stack.children.length;
    let prevTile = this.stack.children[stackCount - 1];

    // is tile above prev tile to be stackable
    if (
      (this.tile.x + this.tile.width >= prevTile.x &&
        this.tile.x + this.tile.width <= prevTile.x + prevTile.width) ||
      (this.tile.x >= prevTile.x && this.tile.x <= prevTile.x + prevTile.width)
    ) {
      return true;
    } else {
      return false;
    }
  }

  newTile(width: number) {
    this.tile.x += canvas.width; //move tile out of sight

    // create new tile
    let stackCount = this.stack.children.length;
    let aTile = new Tile(
      this.stack.children[stackCount - 1].y - TILE_HEIGHT,
      0,
      width
    );

    // assign new tile and add to scene
    this.tile = aTile;
    this.add(aTile);

    // check collisions
    this.physics.onCollideWalls(
      this.tile,
      this.tile.switchDirection,
      this.tile
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                                RUN GAME.                                   */
/* -------------------------------------------------------------------------- */
let mainLevel = new MainLevel();
let game = new Game(mainLevel);
