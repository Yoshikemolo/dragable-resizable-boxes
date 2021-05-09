import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, HostListener, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

const enum Status {
  OFF = 0,
  OVER = 1,
  RESIZE = 2,
  MOVE = 3,
  RESIZE_TOP = 4,
  RESIZE_RIGHT = 5,
  RESIZE_BOTTOM = 6,
  RESIZE_LEFT = 7,
  
}
@Component({
  selector: 'app-resizable-draggable',
  templateUrl: './resizable-draggable.component.html',
  styleUrls: ['./resizable-draggable.component.scss']
})
export class ResizableDraggableComponent implements OnInit, AfterViewInit {

  @Input() boxId: number;
  @Input() zIndex: number;
  @Input() active: boolean;
  @Input() collisionBox: any;
  @Input() mainContainerX: number;
  @Input() mainContainerY: number;
  @Input() mainContainerWidth: number;
  @Input() mainContainerHeight: number;
  @Input() width: number;
  @Input() height: number;
  @Input() left: number;
  @Input() top: number;

  @Output() updateBox = new EventEmitter<any>();
  @Output() closeBoxEvent = new EventEmitter<number>();

  @ViewChild('box') public box: ElementRef;

  private boxPosition: { left: number, top: number };
  private containerPos: { left: number, top: number, right: number, bottom: number };
  public mouse: {x: number, y: number}
  public status: Status = Status.OFF;
  private mouseClick: {x: number, y: number};
  private offsetX  = 20;
  private offsetY = 20;
  private minWidth = 50;
  private minHeight = 50;
  private grid = 5;
  private initWidth: number;
  private initHeight: number;
  private xRatio = 1;
  private yRatio = 1;

  ngOnInit() {}

  ngAfterViewInit() {
    this.loadBox();
    this.loadContainer();
  }

  private loadBox() {
    this.initSize();
    this.boxPosition = {left: this.mainContainerX, top: this.mainContainerY};
  }

  private initSize() {
    this.initWidth = document.querySelector('#box-container').getBoundingClientRect().width;
    this.initHeight = document.querySelector('#box-container').getBoundingClientRect().height;
  }

  private loadContainer() {
    const left = this.mainContainerX;
    const top = this.mainContainerY;
    const right = left + this.mainContainerWidth;
    const bottom = top + this.mainContainerHeight;
    this.containerPos = { left, top, right, bottom };
  }

  setStatus(event: MouseEvent, status: number) {
    this.mouseClick = {
      x: event.clientX,
      y: event.clientY
    };
    this.containerPos = {
      left: this.left,
      top: this.top,
      right: this.left + this.width,
      bottom: this.top + this.height
    };
    switch (status) {
      case Status.RESIZE:
        event.stopPropagation();
        break;
      case Status.RESIZE_TOP:
        event.stopPropagation();
        break;
      case Status.RESIZE_RIGHT:
        event.stopPropagation();
        break;
      case Status.RESIZE_BOTTOM:
        event.stopPropagation();
        break;
      case Status.RESIZE_LEFT:
        event.stopPropagation();
        break;
      case Status.MOVE:
        event.stopPropagation();
        break;
      default:
        this.loadBox();
        break;
    }
    this.status = status;
  }

  updateBoxData(): void {
    const box = {
      id: this.boxId,
      zIndex: this.zIndex,
      x: this.left,
      y: this.top,
      width: this.width,
      height: this.height,
      collisionBox: this.collisionBox
    };
    this.updateBox.emit(box);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouse = { x: event.clientX, y: event.clientY };
    switch (this.status) {
      case Status.RESIZE:
        this.resize();
        break;
      case Status.RESIZE_TOP:
        this.resize();
        break;
      case Status.RESIZE_RIGHT:
        this.resize();
        break;
      case Status.RESIZE_BOTTOM:
        this.resize();
      break;
      case Status.RESIZE_LEFT:
        this.resize();
      break;
      case Status.MOVE:
        this.move();
        break;
      default:
        break;
    }
  }

  onResize(event): void {
    setTimeout(() => {
      const newWidth = document.querySelector('#box-container').getBoundingClientRect().width;
      const newHeight = document.querySelector('#box-container').getBoundingClientRect().height;
      this.xRatio = newWidth / this.initWidth; 
      this.yRatio = newHeight / this.initHeight;
      this.responsive();
      this.initSize();
      this.fitToGrid();
    }, 150);
  }

  checkConstrains(): void {
    this.constrainX();
    this.constrainY();
    this.updateBoxData();
    this.fitToGrid();
  }

  checkMagnetic(): void {
    if ( this.collisionBox ) {
      const centerBoxX = this.left + this.width / 2;
      const centerBoxY = this.top + this.height / 2;
      const centerCollisionBoxX = this.collisionBox.x + this.collisionBox.width / 2;
      const centerCollisionBoxY = this.collisionBox.y + this.collisionBox.height / 2;
      const offsetX = centerCollisionBoxX - centerBoxX;
      const offsetY = centerCollisionBoxY - centerBoxY;
      const leftOrRight = (Math.abs(offsetX) <= this.collisionBox.width);
      const topOrBottom = (Math.abs(offsetY) <= this.collisionBox.height);
      if (topOrBottom && Math.abs(offsetY) < Math.abs(offsetX)) {
        if (this.left < this.collisionBox.x ) {
            this.left = this.collisionBox.x - this.width;
        } else {
          this.left = this.collisionBox.x + this.collisionBox.width;
        }
      }
      if (leftOrRight && Math.abs(offsetY) >= Math.abs(offsetX)) {
        if (this.top < this.collisionBox.y ) {
            this.top = this.collisionBox.y - this.height;
        } else {
          this.top = this.collisionBox.y + this.collisionBox.height;
        }
      }
    }
    this.checkConstrains();
  }

  /**
   * ###########################################  RESIZE  #############################################
   */
  private resize() {
    if(this.status === Status.RESIZE || this.status === Status.RESIZE_RIGHT) {
      if (this.resizeConditionXMeet()) {
        if (this.mouse.x > this.boxPosition.left + this.offsetX && this.width >= this.minWidth)  {
          this.width = this.toGrid(this.mouse.x - this.left - this.mainContainerX);
        } else {
          this.width = this.minWidth;
        }
      } else {
        this.width = this.mainContainerWidth - this.left;
      }
    }

    if(this.status === Status.RESIZE_LEFT) {
      if (this.moveConditionXMeet() || this.unlockX()) {
        this.left = this.toGrid(this.containerPos.left + (this.mouse.x - this.mouseClick.x));
      } else {
        if (this.left < this.mainContainerWidth / 2 ) {
          this.left = 0;
        } else {
          this.left = this.mainContainerWidth - this.width;
        }
      }
      this.width = this.containerPos.right - this.left;
    }

    if(this.status === Status.RESIZE || this.status === Status.RESIZE_BOTTOM ) {
      if (this.resizeConditionYMeet()) {
        if (this.mouse.y > this.boxPosition.top + this.offsetY && this.height >= this.minHeight) {
          this.height = this.toGrid(this.mouse.y - this.top - this.mainContainerY);
        } else {
          this.height = this.minHeight;
        }
      } else {
        this.height = this.mainContainerHeight - this.top;
      }
    }

    if(this.status === Status.RESIZE_TOP) {
      if (this.moveConditionYMeet() || this.unlockY()) {
        this.top = this.toGrid(this.containerPos.top + (this.mouse.y - this.mouseClick.y));
      } else {
        if (this.top < this.mainContainerHeight / 2 ) {
          this.top = 0;
        } else {
          this.top = this.mainContainerHeight - this.height;
        }
      }
      this.height = this.containerPos.bottom - this.top;
    }

    this.checkConstrains();
  }

  private resizeConditionXMeet() {
    const rightLimit = this.mainContainerX + this.mainContainerWidth - this.offsetX;
    return (this.mouse.x <= rightLimit);
  }

  private resizeConditionYMeet() {
    const bottomLimit = this.mainContainerY + this.mainContainerHeight - this.offsetY;
    return (this.mouse.y <= bottomLimit);
  }

  /**
   * #############################################  MOVE  ##############################################
   */
  private move() {
    if (this.moveConditionXMeet() || this.unlockX()) {
      this.left = this.toGrid(this.containerPos.left + (this.mouse.x - this.mouseClick.x));

    } else {
      if (this.left < this.mainContainerWidth / 2 ) {
        this.left = 0;
      } else {
        this.left = this.mainContainerWidth - this.width;
      }
    }

    if (this.moveConditionYMeet() || this.unlockY()) {
      this.top = this.toGrid(this.containerPos.top + (this.mouse.y - this.mouseClick.y));
    } else {
      if (this.top < this.mainContainerHeight / 2 ) {
        this.top = 0;
      } else {
        this.top = this.mainContainerHeight - this.height;
      }
    }
    this.checkConstrains();
    this.checkMagnetic();
  }

  private moveConditionXMeet() {
    return (this.left > this.offsetX && this.left + this.width < this.mainContainerWidth - this.offsetX);
  }

  private unlockX() {
    const offsetX = this.mouse.x - this.containerPos.left;
    return (
      (Math.abs(offsetX) > this.offsetX &&
      this.left >= 0 && this.left + this.width <= this.mainContainerWidth)
    );
  }

  private unlockY() {
    const offsetY = this.mouse.y - this.containerPos.top;
    return (
      (Math.abs(offsetY) > this.offsetY &&
      this.top >= 0 && this.top + this.height <= this.mainContainerHeight)
    );
  }

  private moveConditionYMeet() {
    return (
      this.top > this.offsetY &&
      this.top + this.height < this.mainContainerHeight - this.offsetY
    );
  }

  private constrainX() {
    if (this.left < this.offsetX) { this.left = 0; }
    if (this.left + this.width > this.mainContainerWidth - this.offsetX) { this.left = this.mainContainerWidth - this.width; }
    if (this.width > this.mainContainerWidth) { this.width = this.mainContainerWidth; }
    if (this.width < this.minWidth ) { this.width = this.minWidth; }
  }

  private constrainY() {
    if (this.top < this.offsetY) { this.top = 0; }
    if (this.top + this.height > this.mainContainerHeight - this.offsetY) { this.top = this.mainContainerHeight - this.height; }
    if (this.height > this.mainContainerHeight) { this.height = this.mainContainerHeight; }
    if (this.height < this.minHeight ) { this.height = this.minHeight; }
  }

  /**
   * #############################################  CLOSE  ##############################################
   */
  public closeBoxAction(boxId) {
    this.closeBoxEvent.emit(boxId);
  }

  /**
   * #############################################  UTILS  ##############################################
   */

  public toGrid(value: number): number {
    return Math.round(value / this.grid) * this.grid;
  }

  public responsive(): void {
    this.left = (this.left * this.xRatio);
    this.width = (this.width * this.xRatio);
    this.top = (this.top * this.yRatio);
    this.height = (this.height * this.yRatio);
    this.checkConstrains();
  }

  public fitToGrid(): void {
    this.left = this.toGrid(this.left);
    this.top = this.toGrid(this.top);
    this.width = this.toGrid(this.width);
    this.height = this.toGrid(this.height);
  }
}
