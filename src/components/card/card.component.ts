import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-card',
  imports: [
    FontAwesomeModule,
    CommonModule,
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  @Input() public isMyWishList: boolean = false;

  @Input() public isReserved: boolean | undefined;

  @Output() public toggleReserve = new EventEmitter<number>()
  @Output() public editProduct = new EventEmitter<any>()

  // Cambiar de propiedad estática a BehaviorSubject reactivo
  private static _showReserveButtonSubject = new BehaviorSubject<boolean>(false);
  public static showReserveButton$ = CardComponent._showReserveButtonSubject.asObservable();
  
  public showReserveButton = false;
  private subscription?: Subscription;

  public parent = CardComponent;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Suscribirse a los cambios del showReserveButton
    this.subscription = CardComponent.showReserveButton$.subscribe(value => {
      this.showReserveButton = value;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Método estático para actualizar el estado
  public static setShowReserveButton(value: boolean) {
    CardComponent._showReserveButtonSubject.next(value);
  }

  // Getter para mantener compatibilidad con código existente
  public static get showReserveButton(): boolean {
    return CardComponent._showReserveButtonSubject.value;
  }

  // Setter para mantener compatibilidad con código existente  
  public static set showReserveButton(value: boolean) {
    CardComponent.setShowReserveButton(value);
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/img/empty.webp';
    this.cdr.detectChanges();
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

  getDropdownClasses(label: string) {
    let classes = ['block', 'w-full', 'rounded-lg', 'p-2', 'text-center', 'font-medium', 'transition-all', 'duration-200', 'hover:shadow-md'];

    switch (label.toLocaleLowerCase()) {
      case "steam":
        classes.push('bg-gradient-to-r', 'from-blue-600', 'to-blue-800', 'text-white', 'hover:from-blue-700', 'hover:to-blue-900');
        break;

      case "amazon":
      case "instant gaming":
        classes.push('bg-gradient-to-r', 'from-orange-500', 'to-yellow-500', 'text-white', 'hover:from-orange-600', 'hover:to-yellow-600');
        break;

      default:
        classes.push('bg-gradient-to-r', 'from-blue-600', 'to-purple-700', 'text-white', 'hover:from-blue-700', 'hover:to-purple-800');
        break;
    }

    return classes.join(' ');
  }

}
