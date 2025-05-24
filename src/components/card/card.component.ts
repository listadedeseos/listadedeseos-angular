import { Component, Input, SimpleChanges } from '@angular/core';
import { environment } from '../../environments/environment';
import { Utils } from '../../utils/utils';
import { ApiService } from '../../apiConnection/ApiService';
import { AuthenticationService } from '../../apiConnection/authentication.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {

  @Input() public index: number | undefined;
  @Input() public img: string = '';
  @Input() public name: string = '';
  @Input() public price: string = '';
  @Input() public count: number | undefined;

  @Input() public principalUrl: string = '';
  @Input() public principalLabelString: string = '';

  @Input() public secondaryUrl: string = '';
  @Input() public secondaryLabelString: string = '';

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/img/empty.webp';
  }

}
