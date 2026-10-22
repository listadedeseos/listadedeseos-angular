import { Component, Input, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';
import { ThemeConfig } from '../../enum/theme';
import { LoadingComponent } from '../loading/loading.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalRef } from '@some-angular-utils/modal';

@Component({
  selector: 'app-wishlist-form',
  imports: [
    LoadingComponent,
    ReactiveFormsModule,
    FontAwesomeModule,
  ],
  templateUrl: './wishlist-form.component.html',
  styleUrl: './wishlist-form.component.scss',
})
export class WishlistFormComponent {
  @Input() id = 0;

  private modalRef = inject<ModalRef<WishlistFormComponent>>(ModalRef);

  public loading = false
  public saveForm: FormGroup = new FormGroup({});
  public showModalImage = false
  public dropdowns: any = {}
  public themes = ThemeConfig.getAllThemes();

  constructor(
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.createForm();
    // this.apiService.getSelector(this.dropdowns);

    if (this.id != 0) {
      this.getById(this.id);
    }
  }

  get modalTitle(): string {
    return (this.id ? 'Editar' : 'Nueva') + ' lista de deseos';
  }

  acceptFormFunction() {
    this.saveEntity()
  }

  closeFormFunction() {
    this.modalRef.dismiss();
  }

  createForm() {
    this.saveForm = new FormGroup({

      name: new FormControl('', [Validators.required]),
      theme: new FormControl(null),
      date_end: new FormControl(null),
      steam_username: new FormControl(null),
      amazon_wishlist_id: new FormControl(null),

    })
  }

  deleteDateEnd() {
    this.saveForm.get('date_end')?.setValue(null);
  }

  getById(id: number) {
    this.loading = true;
    this.apiService.getById(Utils.urls.wishlist, id).subscribe({
      next: (data: any) => {
        this.saveForm.patchValue(data.wishlist);
      },
      error: (error: any) => {
        console.error('ERROR obtener productos. ' + error);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  saveEntity() {
    if (this.saveForm.valid) {
      this.loading = true;

      if (this.saveForm.value.date_end == null) {
        delete this.saveForm.value.date_end;
      }

      this.apiService.save(Utils.urls.wishlist, this.saveForm.value, this.id).subscribe({
        next: (response: any) => {
          this.modalRef.close(response);
        },
        error: (error: any) => {
          // Utils.showErrorMessage('Error al guardar el producto');
        },
        complete: () => {
          this.loading = false;
        }
      })
    } else {
      // Utils.showErrorMessage('Debe completar todos los campos');
    }
  }

}
