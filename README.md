# Pico Planet

Pico Planet is a simple game implemented in JavaScript using the Pico-Planet game engine. In this game, the player controls a moving tile that needs to stack on top of static tiles to build a tower. The goal is to stack as many tiles as possible without missing a stack.

## Table of Contents

- [Game Mechanics](#game-mechanics)
- [Entities](#entities)
- [Input Controller](#input-controller)
- [Scene](#scene)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Game Mechanics

The game mechanics define various constants and behaviors of the game.

- `COLOR_BACKGROUND`: The background color of the game canvas.
- `COLOR_TILE`: The color of the moving tile.
- `COLOR_STATIC_TILE`: The color of the static tiles.
- `TILE_WIDTH`: The width of the tiles.
- `TILE_HEIGHT`: The height of the tiles.
- `SPEED`: The speed at which the moving tile moves.

## Entities

There are several entities in the game:

### Tile

The `Tile` class represents the moving tile that the player controls. It inherits from the `GameObject` class and uses the `TouchController` for input.

- Constructor parameters:

  - `_x`: The initial x-coordinate of the tile.
  - `_y`: The initial y-coordinate of the tile.
  - `_width` (optional): The width of the tile.
  - `_height` (optional): The height of the tile.

- Methods:
  - `update()`: Updates the state of the tile.
  - `render()`: Renders the tile on the canvas.
  - `switchDirection()`: Switches the direction of the tile.

### StaticTile

The `StaticTile` class represents the static tiles that the player needs to stack on. It inherits from the `GameObject` class.

- Constructor parameters:

  - `_x`: The initial x-coordinate of the static tile.
  - `_y`: The initial y-coordinate of the static tile.
  - `_width`: The width of the static tile.
  - `_height`: The height of the static tile.

- Methods:
  - `update()`: Updates the state of the static tile.
  - `render()`: Renders the static tile on the canvas.

### Stack

The `Stack` class represents a group of static tiles stacked on top of each other. It inherits from the `Group` class.

- Constructor parameters: None.

- Methods:
  - `update()`: Updates the state of the stack.
  - `render()`: Renders the stack on the canvas.

## Input Controller

The `TouchController` class extends the `InputController` class and handles the player input using mouse events.

- Properties:

  - `clicked`: Indicates whether the mouse button is currently clicked.

- Constructor: Adds event listeners for mouse down and mouse up events to handle the clicked state.

- Methods:
  - `update(gameObject)`: Updates the game object's command based on the clicked state.

## Scene

The `MainLevel` class represents the main scene of the game. It inherits from the `Scene` class.

- Properties:

  - `tile`: An instance of the `Tile` class representing the moving tile.
  - `stack`: An instance of the `Stack` class representing the stack of static tiles.

- Constructor: Initializes the scene.

- Methods:
  - `create()`: Creates the initial objects in the scene.
  - `update()`: Updates the state of the scene.
  - `render()`: Renders the scene on the canvas.
  - `onActiveTileStopped()`: Handles the logic when the moving tile stops.
  - `isTileStackable()`: Checks if the moving tile can be stacked on the topmost static tile.
  - `newTile(width)`: Creates a new moving tile and adds it to the scene.

## Installation

To install and run the game locally, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/your-username/your-repository.git
```

2. Change into the project directory:

```bash
cd your-repository
```

## Usage

To play the game, open the index.html file in a web browser. The game will start automatically.

- Controls:
  - Mouse click: Stops the moving tile.

## Contributing

Contributions to the project are welcome. If you find any issues or have suggestions for improvements, feel free to open a new issue or submit a pull request.

## License

The project is licensed under the MIT License.
