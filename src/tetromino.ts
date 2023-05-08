import { COLORS, COLORSDARKER, COLORSLIGHTER, SHAPES } from "./constants";

export interface ITetromino {
  x: number;
  y: number;
  color: string;
  shape: number[][];
}

export class Tetromino implements ITetromino {
  x: number;
  y: number;
  color: string;
  shape: number[][];
  colorLighter: string;
  colorDarker: string;

  constructor(private context: CanvasRenderingContext2D) {
    this.spawn();
  }

  spawn() {
    const typeId = this.randomizeTetrominoType(COLORS.length - 1);
    this.shape = SHAPES[typeId];
    this.color = COLORS[typeId];
    this.colorLighter = COLORSLIGHTER[typeId];
    this.colorDarker = COLORSDARKER[typeId];
    this.x = typeId === 4 ? 4 : 3;
    this.y = 0;
  }

  move(t: ITetromino) {
    this.x = t.x;
    this.y = t.y;
    this.shape = t.shape;
  }

  draw() {
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.context.fillStyle = this.color;
          const currentX = this.x + x;
          const currentY = this.y + y;
          this.context.fillRect(currentX, currentY, 1, 1);
          this.add3D(this.context, currentX, currentY);
        }
      });
    });
  }

  drawNext(contextNext: CanvasRenderingContext2D) {
    contextNext.clearRect(
      0,
      0,
      contextNext.canvas.width,
      contextNext.canvas.height
    );
    this.shape.forEach((row, y) => {
      return row.forEach((value, x) => {
        if (value > 0) {
          this.addNextShadow(contextNext, x, y);
          this.add3D(contextNext, x, y);
        }
      });
    });
  }

  private addNextShadow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ): void {
    ctx.fillStyle = this.color;
    ctx.fillRect(x, y, 1.025, 1.025);
  }

  add3D(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    //Darker Color
    ctx.fillStyle = this.colorDarker;
    // Vertical
    ctx.fillRect(x + 0.9, y, 0.1, 1);
    // Horizontal
    ctx.fillRect(x, y + 0.9, 1, 0.1);

    //Darker Color - Inner
    // Vertical
    ctx.fillRect(x + 0.65, y + 0.3, 0.05, 0.3);
    // Horizontal
    ctx.fillRect(x + 0.3, y + 0.6, 0.4, 0.05);

    // Lighter Color - Outer
    ctx.fillStyle = this.colorLighter;

    // Lighter Color - Inner
    // Vertical
    ctx.fillRect(x + 0.3, y + 0.3, 0.05, 0.3);
    // Horizontal
    ctx.fillRect(x + 0.3, y + 0.3, 0.4, 0.05);

    // Lighter Color - Outer
    // Vertical
    ctx.fillRect(x, y, 0.05, 1);
    ctx.fillRect(x, y, 0.1, 0.95);
    // Horizontal
    ctx.fillRect(x, y, 1, 0.05);
    ctx.fillRect(x, y, 0.95, 0.1);
  }

  randomizeTetrominoType(noOfTypes: number): number {
    return Math.floor(Math.random() * noOfTypes + 1)
  }
}
