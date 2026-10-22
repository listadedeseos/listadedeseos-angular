import { Component, Input, inject } from '@angular/core';
import { ApiService } from '../../apiConnection/ApiService';
import { ModalRef } from '@some-angular-utils/modal';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-custom-delete',
  imports: [
    FontAwesomeModule,
  ],
  templateUrl: './customDelete.component.html',
})
export class CustomDeleteComponent {

  @Input() id = 0;
  @Input() url = '';

  private modalRef = inject<ModalRef<CustomDeleteComponent>>(ModalRef);

  constructor(
    private apiService: ApiService
  ) { }

  acceptFormFunction() {
    this.apiService.deleteById(this.url, this.id).subscribe({
      next: (data: any) => {
        this.modalRef.close();
      },
      error: (error: any) => {
        console.error('ERROR al eliminar producto. ' + error);
      },
    });
  }

  closeFormFunction() {
    this.modalRef.dismiss();
  }

}
