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
  selectedBoxId;
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
    const id = this.boxes.length + 1;
    const box = {
      id,
      zIndex: id * 100,
      width: this.defaultBoxWidth,
      height: this.defaultBoxHeight,
      x: (this.mainContainer.width - this.defaultBoxWidth) / 2,
      y: (this.mainContainer.height - this.defaultBoxHeight) / 2,
      collisionBox: null
    };
    this.boxes.push(box);
    this.selectBox(box);
    this.updateBox(box);
  }

  updateBox(updatedBox) {
    this.boxes.forEach((boxToUpdate, i) => {
      if (boxToUpdate.id === updatedBox.id) {
        this.boxes[i].x = updatedBox.x;
        this.boxes[i].y = updatedBox.y;
        this.boxes[i].width = updatedBox.width;
        this.boxes[i].height = updatedBox.height;
        this.boxes[i].collisionBox = this.checkCollisions(updatedBox);
        this.selectBox(boxToUpdate);
      }
    });
  }

  selectBox(selectedBox): void {
    if (this.selectedBoxId !== selectedBox.id) {
      this.selectedBoxId = selectedBox.id;
      const newBoxes = [];
      let zIndex = 0;
      this.boxes.forEach((box, i) => {
        if (box.id !== selectedBox.id) {
          zIndex += 100;
          box.zIndex = zIndex;
          newBoxes.push(box);
        }
      });
      zIndex += 100;
      selectedBox.zIndex = zIndex;
      newBoxes.push(selectedBox);
      this.boxes = newBoxes;
    }
  }

  closeBox(boxId: number): void {
    this.boxes.forEach((box, i) => {
      if (box.id === boxId) { this.boxes.splice(i, 1); }
    });
  }

  checkCollisions(checkingBox) {
    let collisionBox = null;
    this.boxes.forEach((box, i) => {
      this.boxes[i].collisionBox = null;
      if (box.id !== checkingBox.id) {
        if ( this.boxCollision(checkingBox, box) ) {
          collisionBox = box;
          this.boxes.forEach((b, j) => {
            if (b.id === box.id) {
              this.boxes[j].collisionBox = checkingBox;
            }
          });
        }
      }
    });
    if (collisionBox) {
      return collisionBox;
    }
  }

  public boxCollision(checkingBox, box): boolean {
    const l1 = checkingBox.x;
    const r1 = checkingBox.x + checkingBox.width;
    const b1 = checkingBox.y + checkingBox.height;
    const t1 = checkingBox.y;

    const l2 = box.x;
    const r2 = box.x + box.width;
    const b2 = box.y + box.height;
    const t2 = box.y;

    const bottomInside = (b1 >= t2 && b1 <= b2) || (b2 >= t1 && b2 <= b1);
    const topInside = (t1 >= t2 && t1 <= b2) || (b2 >= t1 && b2 <= b1);
    const topOrBottomInside = ( bottomInside || bottomInside);

    const leftInside = (l1 >= l2 && l1 <= r2) || (l2 >= l1 && l2 <= r1);
    const rightInside = (r1 >= l2 && r1 <= r2) || (r2 >= l1 && r2 <= r1);
    const leftOrRightInside = ( leftInside || rightInside);

    return (topOrBottomInside && leftOrRightInside);
  }

}

