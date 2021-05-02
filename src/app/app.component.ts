import { Component, ElementRef, Renderer2, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

 boxContainer;

  title = 'angular-resizable-draggable';
  marginX = 40;
  marginY = 40;
  mainContainer = {
    width: window.innerWidth - this.marginX * 2,
    height: window.innerHeight - this.marginY * 2,
    x: this.marginX,
    y: this.marginY,
  };
  defaultBoxWidth = this.mainContainer.width / 4;
  defaultBoxHeight = this.mainContainer.height / 4;
  boxes = [];

  constructor(private elRef: ElementRef, private renderer: Renderer2) { }

  ngOnInit(): void {
      this.boxContainer = this.elRef.nativeElement.querySelector('#box-container');
      this.containerResize(this.mainContainer.width, this.mainContainer.height);
      this.addBox();
  }

  onResize(event): void {
    this.containerResize(event.target.innerWidth - this.marginX * 2 , event.target.innerHeight - this.marginY * 2);
  }

  containerResize(width, height): void {
    this.mainContainer.width = width;
    this.mainContainer.height = height;
    this.renderer.setStyle(this.boxContainer, 'width', width + 'px');
    this.renderer.setStyle(this.boxContainer, 'height', height + 'px');
  }

  addBox(): void {
    const box = {
      width: this.defaultBoxWidth,
      height: this.defaultBoxHeight,
      x: (this.mainContainer.width - this.defaultBoxWidth) / 2,
      y: (this.mainContainer.height - this.defaultBoxHeight) / 2,
    };
    this.boxes.push(box);
  }

  selectBox(boxId: number): void {
    const newBoxes = [];
    const selectedBox = this.boxes[boxId];
    this.boxes.forEach((box, i) => {
      if (i !== boxId) {
        newBoxes.push(box);
      }
    });
    newBoxes.push(selectedBox);
    this.boxes = newBoxes;
  }

  closeBox(boxId: number): void {
    this.boxes.splice(boxId, 1);
  }
}
