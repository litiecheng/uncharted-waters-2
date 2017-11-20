import ports from "./data/ports";
import state from "./state";

import { IBuildings, IPort, ICollisionIndices, IAssets } from "./types";

export default class Map {
  public canvas: HTMLCanvasElement;
  public buildings: IBuildings;
  private assets: IAssets;
  private port: IPort;
  private tilesize: number = 32;
  private columns: number = 96;
  private rows: number = 96;
  private context: CanvasRenderingContext2D;
  private collisionCoordinates: object;
  private collisionIndices: ICollisionIndices;
  private buildingIndices: object;

  constructor(assets) {
    this.assets = assets;
    this.port = ports.ports[state.portId];

    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.canvas.width = this.columns * this.tilesize;
    this.canvas.height = this.rows * this.tilesize;

    this.setupCollision();
    this.setupBuildings();
    this.draw();
  }

  public outOfBoundsAt(position) {
    return Boolean(
      position.x < 0 || (position.x + 64) - this.tilesize >= this.canvas.width
      || position.y - 32 < 0 || position.y >= this.canvas.height,
    );
  }

  public tileCollisionAt(position) {
    const collision = ((this.collisionCoordinates || {})[position.x] || {})[position.y];
    const collisionRight = ((this.collisionCoordinates || {})[(position.x + 64) - this.tilesize] || {})[position.y];

    if (collision) {
      const isLeftmost = collision >= this.collisionIndices.leftmost
        && collision < this.collisionIndices.rightmost;
      return !isLeftmost;
    }

    if (collisionRight) {
      const isRightmost = collisionRight >= this.collisionIndices.rightmost
        && collisionRight < this.collisionIndices.full;
      return !isRightmost;
    }

    return false;
  }

  private setupCollision() {
    this.collisionCoordinates = {};
    this.collisionIndices = ports.tilesets[this.port.tileset].collisionIndices;
  }

  private setupBuildings() {
    this.buildings = {};
    this.buildingIndices = ports.tilesets[this.port.tileset].buildingIndices;
  }

  private draw() {
    const tileset = this.assets[`tileset${this.port.tileset}`];

    this.port.tiles.forEach((tile, i) => {
      const targetX = (i % this.columns) * this.tilesize;
      const targetY = Math.floor(i / this.columns) * this.tilesize;

      this.context.drawImage(
        tileset,
        tile * this.tilesize, 0,
        this.tilesize, this.tilesize,
        targetX, targetY,
        this.tilesize, this.tilesize,
      );

      this.updateCollision(tile, targetX, targetY);
      this.updateBuilding(tile, targetX, targetY);
    });
  }

  private updateCollision(tile, x, y) {
    if (tile >= this.collisionIndices.leftmost) {
      if (!this.collisionCoordinates[x]) {
        this.collisionCoordinates[x] = {};
      }

      this.collisionCoordinates[x][y] = tile;
    }
  }

  private updateBuilding(tile, x, y) {
    Object.keys(this.buildingIndices).forEach((key) => {
      if (this.buildingIndices[key] === tile) {
        delete this.buildingIndices[key];

        this.buildings[key] = {
          x: x - 64,
          y: y + 32,
        };
      }
    });
  }
}
