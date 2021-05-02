import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, HostListener, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

const enum Status {
  OFF = 0,
  OVER = 1,
  RESIZE = 2,
  MOVE = 3
}

@Component({
  selector: 'app-resizable-draggable',
  templateUrl: './resizable-draggable.component.html',
  styleUrls: ['./resizable-draggable.component.scss']
})
export class ResizableDraggableComponent implements OnInit, AfterViewInit {

  @Input() boxId: number;
  @Input() mainContainerX: number;
  @Input() mainContainerY: number;
  @Input() mainContainerWidth: number;
  @Input() mainContainerHeight: number;
  @Input() width: number;
  @Input() height: number;
  @Input() left: number;
  @Input() top: number;

  @Output() closeBoxEvent = new EventEmitter<number>();

  @ViewChild('box') public box: ElementRef;

  private boxPosition: { left: number, top: number };
  private containerPos: { left: number, top: number, right: number, bottom: number };
  public mouse: {x: number, y: number}
  public status: Status = Status.OFF;
  private mouseClick: {x: number, y: number, left: number, top: number};
  private offsetX  = 20;
  private offsetY = 20;
  private minWidth = 48;
  private minHeight = 48;

  ngOnInit() {}

  ngAfterViewInit() {
    this.loadBox();
    this.loadContainer();
  }

  private loadBox() {
    // const {left, top} = this.box.nativeElement.getBoundingClientRect();
    this.boxPosition = {left: this.mainContainerX, top: this.mainContainerY};
  }

  private loadContainer() {
    const left = this.mainContainerX;
    const top = this.mainContainerY;
    const right = left + this.mainContainerWidth;
    const bottom = top + this.mainContainerHeight;
    this.containerPos = { left, top, right, bottom };
  }

  setStatus(event: MouseEvent, status: number) {
    if (status === Status.RESIZE) {
      event.stopPropagation();
    } else if (status === Status.MOVE) {
      this.mouseClick = { x: event.clientX, y: event.clientY, left: this.left, top: this.top };
    } else {
      this.loadBox();
    }
    this.status = status;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouse = { x: event.clientX, y: event.clientY };

    if (this.status === Status.RESIZE) {
      this.resize();
    } else if (this.status === Status.MOVE) {
      this.move();
    } else {
      this.constrainX();
      this.constrainY();
    }
  }

  onResize(event): void {
    this.constrainX();
    this.constrainY();
  }

  /**
   * ###########################################  RESIZE  #############################################
   */
  private resize() {
    if (this.resizeConditionXMeet()) {
      if (this.mouse.x > this.boxPosition.left + this.offsetX && this.width >= this.minWidth)  {
        this.width = this.mouse.x - this.left - this.mainContainerX;
      } else {
        this.width = this.minWidth;
      }
    } else {
      this.width = this.mainContainerWidth - this.left;
    }
    this.constrainX();

    if (this.resizeConditionYMeet()) {
      if (this.mouse.y > this.boxPosition.top + this.offsetY && this.height >= this.minHeight) {
        this.height = this.mouse.y - this.top - this.mainContainerY;
      } else {
        this.height = this.minHeight;
      }
    } else {
      this.height = this.mainContainerHeight - this.top;
    }
    this.constrainY();
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
      this.left = this.mouseClick.left + (this.mouse.x - this.mouseClick.x);
    } else {
      if (this.left < this.mainContainerWidth / 2 ) {
        this.left = 0;
      } else {
        this.left = this.mainContainerWidth - this.width;
      }
    }
    this.constrainX();

    if (this.moveConditionYMeet() || this.unlockY()) {
      this.top = this.mouseClick.top + (this.mouse.y - this.mouseClick.y);
    } else {
      if (this.top < this.mainContainerHeight / 2 ) {
        this.top = 0;
      } else {
        this.top = this.mainContainerHeight - this.height;
      }
    }
    this.constrainY();
  }

  private moveConditionXMeet() {
    return (this.left > this.offsetX && this.left + this.width < this.mainContainerWidth - this.offsetX);
  }

  private unlockX() {
    const offsetX = this.mouse.x - this.mouseClick.left;
    return (
      (Math.abs(offsetX) > this.offsetX &&
      this.left >= 0 && this.left + this.width <= this.mainContainerWidth)
    );
  }

  private unlockY() {
    const offsetY = this.mouse.y - this.mouseClick.top;
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
}
