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

  @Input() public secondaryUrl: string | undefined;
  @Input() public secondaryLabelString: string = '';

  @Input() public isLogged: boolean = false;
  @Input() public isMyWishList: boolean = false;

  @Input() public isReserved: boolean | undefined;

  @Output() public toggleReserve = new EventEmitter<number>()
  @Output() public editProduct = new EventEmitter<any>()
  @Output() public deleteProduct = new EventEmitter<number>()

  // Cambiar de propiedad estática a BehaviorSubject reactivo
  private static _showReserveButtonSubject = new BehaviorSubject<boolean>(false);
  public static showReserveButton$ = CardComponent._showReserveButtonSubject.asObservable();

  public showReserveButton = false;

  public hasEventListener(emitter: EventEmitter<any> | undefined): boolean {
    try {
      return !!(emitter && (emitter as any).observers && (emitter as any).observers.length);
    } catch {
      return false;
    }
  }

  private subscription?: Subscription;

  public parent = CardComponent;

  constructor(private cdr: ChangeDetectorRef) { }

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

}
