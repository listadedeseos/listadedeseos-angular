import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';
import { Router } from '@angular/router';

@Component({
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {

  public loading = false;
  public saveForm: FormGroup = new FormGroup({});
  public errors = false

  constructor(
    private apiService: ApiService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.saveForm = new FormGroup({

      username: new FormControl([], [Validators.required]),
      name: new FormControl('', [Validators.required]),
      surname: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      repassword: new FormControl('', [Validators.required]),
    
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator: ValidatorFn = (form: AbstractControl): { [key: string]: boolean } | null => {
    const password = form.get('password');
    const repassword = form.get('repassword');
    return password && repassword && password.value === repassword.value ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.saveForm.valid) {
      this.loading = true;

      this.apiService.postPetition(Utils.urls.user, this.saveForm.value).subscribe({
        next: (data: any) => {
          data.user.token = data.token;
          localStorage.setItem('user', JSON.stringify(data.user));
          this.router.navigate([sessionStorage.getItem('returnUrl') ?? '/']);

          // Utils.showSuccessMessage('Producto guardado correctamente');
        },
        error: (error: any) => {
          this.errors = true;
          this.loading = false;

          // Utils.showErrorMessage('Error al guardar el producto');
        }
      })
    } else {
      this.errors = true;
      // Utils.showErrorMessage('Debe completar todos los campos');
    }
  }
}
