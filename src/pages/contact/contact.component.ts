import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../apiConnection/ApiService';
import { AuthenticationService } from '../../apiConnection/authentication.service';
import { Utils } from '../../utils/utils';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  imports: [
    FontAwesomeModule,
    ReactiveFormsModule,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {

  public loading = false;
  public saveForm: FormGroup = new FormGroup({});

  constructor(
    private apiService: ApiService,
    public authenticationService: AuthenticationService,
  ) {
    this.createForm();
  }

  createForm() {
    this.saveForm = new FormGroup({
      type: new FormControl('question', [Validators.required]),
      name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      title: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      body: new FormControl('', [Validators.required]),
    });

    // Logged-in users don't see name/email: the API fills them from the account behind the token
    if (this.authenticationService.isLogged) {
      this.saveForm.removeControl('name');
      this.saveForm.removeControl('email');
    }
  }

  onSubmit() {
    if (this.saveForm.valid) {
      this.loading = true;

      this.apiService.save(Utils.urls.contact, this.saveForm.value).subscribe({
        next: (data: any) => {
          // reset() alone nulls `type` (the select's only valid values are the 3 types),
          // which made the next submission fail validation
          this.saveForm.reset({ type: 'question' });
          Utils.ToastUtils.success('Mensaje enviado', 'Tu mensaje ha sido enviado correctamente');
          this.loading = false;
        },
        error: (error: any) => {
          this.loading = false;
          Utils.ToastUtils.error('Error', 'No se pudo enviar el mensaje');
        }
      })
    } else {
      // Marcar todos los campos como touched para mostrar los errores
      this.saveForm.markAllAsTouched();
      Utils.ToastUtils.error('Formulario incompleto', 'Por favor completa todos los campos requeridos');
    }
  }
}
