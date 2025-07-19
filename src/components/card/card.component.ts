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

  @Input() public secondaryUrl: string|undefined;
  @Input() public secondaryLabelString: string = '';

  @Input() public isLogged: boolean = false;

  @Input() public isReserved: boolean | undefined;

  @Output() public toggleReserve = new EventEmitter<number>()

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/img/empty.webp';
  }

  getClasses(label: string) {

    let classes = ['w-full', 'rounded-lg', 'p-1', 'shadow-lg', 'text-center', 'overflow-hidden', 'hover:scale-105'];

    switch (label.toLocaleLowerCase()) {
      case "steam":
        classes.push('bg-gradient-to-br', 'from-blue-600', 'to-blue-800', 'text-red-100');
        break;

      case "amazon":
      case "instant gaming":
        classes.push('bg-gradient-to-br', 'from-orange-600', 'to-yellow-600', 'text-white');
        break;

      default:
        classes.push('bg-gradient-to-br', 'from-blue-600', 'to-purple-700', 'text-red-100');
        break;
    }

    return classes
  }

}
