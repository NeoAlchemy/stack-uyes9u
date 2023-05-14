// Import stylesheets
import './style.css';

/* -------------------------------------------------------------------------- */
/*                                MINI FRAMEWORK.                             */
/* -------------------------------------------------------------------------- */

// boiler plate setup the canvas for the game
var canvas = <HTMLCanvasElement>document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.setAttribute('tabindex', '1');
canvas.style.outline = 'none';
canvas.focus();

// utility functions to use everywhere
class Util {
  static getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    // The maximum is inclusive and the minimum is inclusive
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}

// Input Controller to use everywhere
class InputController {
  public x: number;
  public y: number;

  constructor() {}

  update(gameObject: GameObject) {}
}

class GameObject {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public command: string;

  private inputController: InputController;

  constructor(inputController?) {
    this.inputController = inputController;
  }

  update() {
    this.inputController?.update(this);
  }

  render() {}
}

class Group {
  public x: number;
  public y: number;
  public children: Array<GameObject>;

  constructor() {
    this.children = [];
  }

  update() {
    for (let gameObject of this.children) {
      if (gameObject) gameObject.update();
    }
  }

  render() {
    for (let gameObject of this.children) {
      if (gameObject) gameObject.render();
    }
  }
}

class Physics {
  private gameObjectCollisionRegister: Array<any> = [];
  private wallCollisionRegister: Array<any> = [];
  private objectA: GameObject;
  private objectB: GameObject;

  constructor() {}

  onCollide(
    objectA: GameObject,
    objectB: Group,
    callback: Function,
    scope: any
  ): void;
  onCollide(
    objectA: GameObject,
    objectB: GameObject,
    callback: Function,
    scope: any
  ): void;
  onCollide(
    objectA: GameObject,
    objectB: GameObject | Group,
    callback: Function,
    scope: any
  ): void {
    if (objectA && objectB) {
      if ('children' in objectB) {
        for (let gameObject of objectB.children) {
          this.gameObjectCollisionRegister.push({
            objectA: objectA,
            objectB: gameObject,
            callback: callback,
            scope: scope,
          });
        }
      } else {
        this.gameObjectCollisionRegister.push({
          objectA: objectA,
          objectB: objectB,
          callback: callback,
          scope: scope,
        });
      }
    }
  }

  onCollideWalls(objectA: GameObject, callback: Function, scope: any) {
    if (objectA) {
      this.wallCollisionRegister.push({
        objectA: objectA,
        callback: callback,
        scope: scope,
      });
    }
  }

  update() {
    for (let collisionEntry of this.gameObjectCollisionRegister) {
      if (
        collisionEntry.objectA.x > 0 &&
        collisionEntry.objectA.x < canvas.width &&
        collisionEntry.objectA.y > 0 &&
        collisionEntry.objectA.y < canvas.height &&
        collisionEntry.objectB.x > 0 &&
        collisionEntry.objectB.x < canvas.width &&
        collisionEntry.objectB.y > 0 &&
        collisionEntry.objectB.y < canvas.height &&
        collisionEntry.objectA.x <
          collisionEntry.objectB.x + collisionEntry.objectB.width &&
        collisionEntry.objectA.x + collisionEntry.objectA.width >
          collisionEntry.objectB.x &&
        collisionEntry.objectA.y <
          collisionEntry.objectB.y + collisionEntry.objectB.height &&
        collisionEntry.objectA.y + collisionEntry.objectA.height >
          collisionEntry.objectB.y
      ) {
        collisionEntry.callback.apply(collisionEntry.scope, [
          collisionEntry.objectA,
          collisionEntry.objectB,
        ]);
      }
    }
    for (let wallCollisionEntry of this.wallCollisionRegister) {
      if (
        wallCollisionEntry.objectA.y < 0 ||
        wallCollisionEntry.objectA.y + wallCollisionEntry.objectA.height >
          canvas.height ||
        wallCollisionEntry.objectA.x < 0 ||
        wallCollisionEntry.objectA.x + wallCollisionEntry.objectA.width >=
          canvas.width
      ) {
        wallCollisionEntry.callback.bind(wallCollisionEntry.scope).apply();
      }
    }
  }
}

class Scene {
  public children: Array<GameObject>;
  public groups: Array<Group>;
  public physics: Physics;

  constructor() {
    this.children = [];
    this.groups = [];
    this.physics = new Physics();
  }

  add(object: Group): void;
  add(object: GameObject): void;
  add(object: GameObject | Group): void {
    if ('children' in object) {
      for (let gameObject of object.children) {
        this.children.push(gameObject);
      }
      this.groups.push(object);
    } else {
      this.children.push(object);
    }
  }

  create() {}

  update() {
    for (let gameObject of this.children) {
      if (gameObject) gameObject.update();
    }
    for (let group of this.groups) {
      if (group) group.update();
    }
    this.physics.update();
  }

  render() {
    // update the game background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.width;
    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let gameObject of this.children) {
      if (gameObject) gameObject.render();
    }
    for (let group of this.groups) {
      if (group) group.render();
    }
  }
}

class Game {
  private scene: Scene;
  private id: number;

  constructor(scene: Scene) {
    this.scene = scene;
    this.scene.create();
    //Setup Components
    this.id = requestAnimationFrame(this.gameLoop);
  }

  gameLoop(timestamp) {
    // WARNING: This pattern is not using Times Step and as such
    // Entities must be kept low, when needing multiple entities, scenes,
    // or other components it's recommended to move to a Game Framework

    // game lifecycle events
    game.scene.update();
    game.scene.render();

    // call next frame
    cancelAnimationFrame(game.id);
    game.id = requestAnimationFrame(game.gameLoop);
  }
}

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
      game = new Game(new MainLevel());
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
