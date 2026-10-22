import { Component, Input, ChangeDetectorRef, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalRef } from '@some-angular-utils/modal';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';

@Component({
  selector: 'app-product-form',
  imports: [
    ReactiveFormsModule,
    FontAwesomeModule,
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent {
  @Input() id = 0;
  @Input() wishListId: number | null = null;

  private modalRef = inject<ModalRef<ProductFormComponent>>(ModalRef);

  public loading = false

  public saveForm: FormGroup = new FormGroup({});

  public showModalImage = false

  public dropdowns: any = {}

  public showOptionalFields = false;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.createForm();

    if (this.id != 0) {
      this.getById(this.id);
    }
  }

  get modalTitle(): string {
    return (this.id ? 'Editar' : 'Nuevo') + ' producto';
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
      url_product: new FormControl(null), // Opcional
      url_preview: new FormControl(null), // Opcional
      price: new FormControl(null), // Opcional
      is_active: new FormControl(true),
      wish_list_id: new FormControl(this.wishListId),
    })
  }

  toggleOptionalFields() {
    this.showOptionalFields = !this.showOptionalFields;
  }

  getById(id: number) {
    this.loading = true;
    this.apiService.getById(Utils.urls.product, id).subscribe({
      next: (data: any) => {
        this.saveForm.patchValue(data.data);
        this.loading = false;

        // if this fields have value, show optional fields section
        if(data.data.url_preview || data.data.url_product || data.data.price) {
          this.showOptionalFields = true;
        }

        this.cdr.detectChanges();
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

      this.apiService.save(Utils.urls.product, this.saveForm.value, this.id).subscribe({
        next: (response: any) => {
          Utils.ToastUtils.success('Producto guardado', 'El producto ha sido guardado correctamente.');
          this.modalRef.close(response);
        },
        error: (error: any) => {
          // Utils.showErrorMessage('Error al guardar el producto');
          Utils.ToastUtils.error('Error', 'No se ha podido guardar el producto.');
        },
        complete: () => {
          this.loading = false;
        }
      })
    } else {
      // Utils.showErrorMessage('Debe completar todos los campos');
      Utils.ToastUtils.error('Error', 'Debe completar todos los campos obligatorios.');
    }
  }

}
