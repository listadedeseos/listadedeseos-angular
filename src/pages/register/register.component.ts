import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';

@Component({
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {

  public loading = false;
  public saveForm: FormGroup = new FormGroup({});

  constructor(
    private apiService: ApiService
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.saveForm = new FormGroup({

      username: new FormControl([], [Validators.required]),
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', []),

    })
  }

  onSubmit() {
    if (this.saveForm.valid) {
      this.loading = true;

      this.apiService.postPetition(Utils.urls.user, this.saveForm.value).subscribe({
        next: (response: any) => {
          console.log(response);

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
