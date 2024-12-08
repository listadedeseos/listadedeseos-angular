import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-custom-modal',
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
