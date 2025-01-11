import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent {
  @Input() id = 0;
  @Input() wishListId: number|null = null;
  @Output() closeFunction = new EventEmitter<any>();
  @Output() acceptFunction = new EventEmitter<any>();

  public loading = false

  public saveForm: FormGroup = new FormGroup({});

  public showModalImage = false

  public dropdowns: any = { }

  constructor(
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.createForm();
    // this.apiService.getSelector(this.dropdowns);

    // if (this.id != 0) {
    //   this.getById(this.id);
    // }
  }

  acceptFormFunction() {
    this.saveEntity()
  }

  closeFormFunction() {
    this.closeFunction.emit();
  }

  createForm() {
    this.saveForm = new FormGroup({

      name: new FormControl('', [Validators.required]),
      url_preview: new FormControl('', [Validators.required]),
      url_product: new FormControl('', [Validators.required]),
      price: new FormControl(null),
      is_active: new FormControl(true),
      wish_list_id: new FormControl(this.wishListId),

    })
  }

  // getById(id: number) {
  //   this.loading = true;
  //   this.apiService.getPetition(this.apiService.urls.category, id).subscribe({
  //     next: (data: any) => {
  //       this.saveForm.patchValue(data.category);
  //     },
  //     error: (error: any) => {
  //       console.error('ERROR obtener productos. ' + error);
  //     },
  //     complete: () => {
  //       this.loading = false;
  //     },
  //   });
  // }

  saveEntity() {
    if (this.saveForm.valid) {
      this.loading = true;

      this.apiService.save(Utils.urls.product, this.saveForm.value).subscribe({
        next: (response: any) => {
          this.acceptFunction.emit(response);
          this.closeFormFunction()
          // Utils.showSuccessMessage('Producto guardado correctamente');
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
