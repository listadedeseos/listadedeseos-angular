import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-custom-modal',
  imports: [
    FontAwesomeModule,
  ],
  templateUrl: './customModal.component.html',
})
export class CustomModalComponent {

  @Input() customTitle = ''
  @Input() maxWidth = '2xl'
  @Output() closeFunction = new EventEmitter<any>();
  @Output() acceptFunction = new EventEmitter<any>();

  closeModal() {
    this.closeFunction.emit();
  }

  acceptModal() {
    this.acceptFunction.emit();
  }
}
