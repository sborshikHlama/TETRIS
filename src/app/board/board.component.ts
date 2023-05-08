import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import {
  BLOCK_SIZE,
  COLORS,
  COLS,
  KEY,
  LEVEL,
  LINES_PER_LEVEL,
  POINTS,
  ROWS,
} from 'src/constants';
import { GameService } from 'src/services/game.service';
import { ITetromino, Tetromino } from 'src/tetromino';

@Component({
  selector: 'game-board',
  templateUrl: './board.component.html',
})
export class BoardComponent {
  @ViewChild('board', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  @ViewChild('next', { static: true })
  canvasNext: ElementRef<HTMLCanvasElement>;

  gameStarted: boolean;
  context: CanvasRenderingContext2D;
  contextNext: CanvasRenderingContext2D;
  points: number;
  lines: number;
  level: number;
  tetromino: Tetromino;
  next: Tetromino;
  board: number[][];
  time: { start: number; elapsed: number; level: number };
  requestId: number;

  constructor(private service: GameService) {}

  moves = {
    [KEY.LEFT]: (t: ITetromino): ITetromino => ({ ...t, x: t.x - 1 }),
    [KEY.RIGHT]: (t: ITetromino): ITetromino => ({ ...t, x: t.x + 1 }),
    [KEY.DOWN]: (t: ITetromino): ITetromino => ({ ...t, y: t.y + 1 }),
    [KEY.SPACE]: (t: Tetromino): ITetromino => ({ ...t, y: t.y + 1 }),
    [KEY.UP]: (t: ITetromino): ITetromino => this.service.rotate(t),
  };

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.moves[event.keyCode]) {
      event.preventDefault();
      let p = this.moves[event.keyCode](this.tetromino);
      if (this.service.valid(p, this.board)) {
        this.tetromino.move(p);
        if (event.keyCode === KEY.SPACE) {
          while (this.service.valid(p, this.board)) {
            this.points += POINTS.HARD_DROP;
            this.tetromino.move(p);
            p = this.moves[KEY.SPACE](this.tetromino);
          }
        }
      } else if (this.service.valid(p, this.board)) {
        this.tetromino.move(p);
        if (event.keyCode === KEY.DOWN) {
          this.points += POINTS.SOFT_DROP;
        }
      }
    }
  }

  ngOnInit(): void {
    this.initBoard();
    this.initNext();
    this.resetGame();
  }

  initBoard() {
    this.context = this.canvas.nativeElement.getContext('2d')!;

    this.context.canvas.width = COLS * BLOCK_SIZE;
    this.context.canvas.height = ROWS * BLOCK_SIZE;

    this.context.scale(BLOCK_SIZE, BLOCK_SIZE);
  }

  initNext() {
    this.contextNext = this.canvasNext.nativeElement.getContext('2d')!;

    this.contextNext.canvas.width = 4 * BLOCK_SIZE;
    this.contextNext.canvas.height = 4 * BLOCK_SIZE;

    this.contextNext.scale(BLOCK_SIZE, BLOCK_SIZE);
  }

  play() {
    this.gameStarted = true;
    this.resetGame();
    this.next = new Tetromino(this.context);
    this.tetromino = new Tetromino(this.context);
    this.next.drawNext(this.contextNext);
    this.time.start = performance.now();

    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
    }

    this.animate();
  }

  resetGame() {
    this.points = 0;
    this.lines = 0;
    this.level = 0;
    this.board = this.getEmptyBoard();
    this.time = { start: 0, elapsed: 0, level: LEVEL[this.level] };
  }

  getEmptyBoard(): number[][] {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }

  animate(now = 0) {
    this.time.elapsed = now - this.time.start;
    if (this.time.elapsed > this.time.level) {
      this.time.start = now;
      if (!this.drop()) {
        this.gameOver();
        return;
      }
    }
    this.draw();
    const requestId = requestAnimationFrame(this.animate.bind(this));
  }

  draw() {
    this.context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    );
    this.tetromino.draw();
    this.drawBoard();
  }

  drawBoard() {
    this.board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.context.fillStyle = COLORS[value];
          this.context.fillRect(x, y, 1, 1);
          this.tetromino.add3D(this.context, x, y);
        }
      });
    });
  }

  drop(): boolean {
    let t = this.moves[KEY.DOWN](this.tetromino);
    if (this.service.valid(t, this.board)) {
      this.tetromino.move(t);
    } else {
      this.freeze();
      this.clearLines();
      if (this.tetromino.y === 0) {
        this.gameOver();
        return false;
      }
      this.tetromino = this.next;
      this.next = new Tetromino(this.context);
      this.next.drawNext(this.contextNext);
    }
    return true;
  }

  freeze() {
    this.tetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.board[y + this.tetromino.y][x + this.tetromino.x] = value;
        }
      });
    });
    this.clearLines();
  }

  clearLines() {
    let lines = 0;
    this.board.forEach((row, y) => {
      if (row.every((value) => value !== 0)) {
        lines++;
        this.board.splice(y, 1);
        this.board.unshift(Array(COLS).fill(0));
      }
    });
    if (lines > 0) {
      this.points += this.service.getLinesClearedPoints(lines, this.level);
      this.lines += lines;
      if (this.lines >= LINES_PER_LEVEL) {
        this.level++;
        this.lines -= LINES_PER_LEVEL;
        this.time.level = LEVEL[this.level];
      }
    }
  }

  gameOver() {
    cancelAnimationFrame(this.requestId);
    this.context.fillStyle = 'black';
    this.context.fillRect(1, 3, 8, 1.2);
    this.context.font = '1px Arial';
    this.context.fillStyle = 'red';
    this.context.fillText('GAME OVER', 1.8, 4);
  }
}
