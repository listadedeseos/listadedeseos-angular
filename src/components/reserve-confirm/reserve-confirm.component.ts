import { Component, Input, inject } from '@angular/core';
import { ModalRef } from '@some-angular-utils/modal';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/**
 * Asks a guest to confirm before reserving a product, since only the list owner can undo it.
 * Opened by CardComponent via SAUModalService: `close()` = reserve, `dismiss()` = cancel.
 * It doesn't call the API itself; the card emits `toggleReserve` and its parent does.
 */
@Component({
  selector: 'app-reserve-confirm',
  imports: [
    FontAwesomeModule,
  ],
  templateUrl: './reserve-confirm.component.html',
})
export class ReserveConfirmComponent {

  @Input() name = '';
  @Input() img = '';
  @Input() price = '';

  private modalRef = inject<ModalRef<ReserveConfirmComponent>>(ModalRef);

  confirm() {
    this.modalRef.close(true);
  }

  cancel() {
    this.modalRef.dismiss();
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = '/assets/img/empty.webp';
  }
}
