import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiService } from '../../apiConnection/ApiService';
import { CustomModalComponent } from '../customModal/customModal.component';

@Component({
  selector: 'app-custom-delete',
  imports: [
    CustomModalComponent,
  ],
  templateUrl: './customDelete.component.html',
})
export class CustomDeleteComponent {

  @Input() id = 0;
  @Input() url = '';
  @Output() closeFunction = new EventEmitter<any>();
  @Output() acceptFunction = new EventEmitter<any>();

  constructor(
    private apiService: ApiService
  ) { }

  acceptFormFunction() {
    this.apiService.deleteById(this.url, this.id).subscribe({
      next: (data: any) => {
        this.acceptFunction.emit();
        this.closeFormFunction()
      },
      error: (error: any) => {
        console.error('ERROR al eliminar producto. ' + error);
      },
    });
  }

  closeFormFunction() {
    this.closeFunction.emit();
  }

}
