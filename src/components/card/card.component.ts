import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {

  @Input() public index: number | undefined;
  @Input() public img: string = '';
  @Input() public aspect: string = 'square';
  @Input() public name: string = '';
  @Input() public price: string = '';
  @Input() public count: number | undefined;

  @Input() public principalUrl: string = '';
  @Input() public principalLabelString: string = '';

  @Input() public secondaryUrl: string = '';
  @Input() public secondaryLabelString: string = '';

  @Input() public isLogged: boolean = false;

  @Input() public isReserved: boolean | undefined;

  @Output() public toggleReserve = new EventEmitter<number>()

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/img/empty.webp';
  }

}
