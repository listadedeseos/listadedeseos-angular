import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';

@Component({
  selector: 'app-wishlist-form',
  templateUrl: './wishlist-form.component.html',
  styleUrl: './wishlist-form.component.scss',
})
export class WishlistFormComponent {
  @Input() id = 0;
  @Output() closeFunction = new EventEmitter<any>();
  @Output() acceptFunction = new EventEmitter<any>();

  public loading = false

  public saveForm: FormGroup = new FormGroup({});

  public showModalImage = false

  public dropdowns: any = {}

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

  acceptFormFunction() {
    this.saveEntity()
  }

  closeFormFunction() {
    this.closeFunction.emit();
  }

  createForm() {
    this.saveForm = new FormGroup({

      name: new FormControl('', [Validators.required]),
      steam_username: new FormControl('', []),
      amazon_wishlist_id: new FormControl('', []),

    })
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

      this.apiService.save(Utils.urls.wishlist, this.saveForm.value, this.id).subscribe({
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
