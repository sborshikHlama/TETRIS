import { Injectable } from '@angular/core';
import { COLS, POINTS, ROWS } from 'src/constants';
import { ITetromino } from 'src/tetromino';

@Injectable({ providedIn: 'root' })
export class GameService {
  valid(t: ITetromino, board: number[][]): boolean {
    return t.shape.every((row, dy) => {
      return row.every((value, dx) => {
        let x = t.x + dx;
        let y = t.y + dy;
        return (
          this.isEmpty(value) ||
          (this.insideWalls(x) &&
            this.aboveFloor(y) &&
            this.notOccupied(board, x, y))
        );
      });
    });
  }

  isEmpty(value: number): boolean {
    return value === 0;
  }

  insideWalls(x: number): boolean {
    return x >= 0 && x < COLS;
  }

  aboveFloor(y: number): boolean {
    return y <= ROWS;
  }

  notOccupied(board: number[][], x: number, y: number): boolean {
    return board[y] && board[y][x] === 0;
  }

  rotate(tetromino: ITetromino) {
    let p: ITetromino = JSON.parse(JSON.stringify(tetromino));
    for (let y = 0; y < p.shape.length; y++) {
      for (let x = 0; x < y; x++) {
        [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
      }
    }
    p.shape.forEach((row) => row.reverse());
    return p;
  }

  getLinesClearedPoints(lines: number, level: number) {
    const lineClearPoints =
      lines === 1
        ? POINTS.SINGLE
        : lines === 2
        ? POINTS.DOUBLE
        : lines === 3
        ? POINTS.TRIPLE
        : lines === 4
        ? POINTS.TETRIS
        : 0;

    return (level + 1) * lineClearPoints;
  }
}
