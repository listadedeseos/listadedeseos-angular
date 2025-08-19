import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';
import { Router } from '@angular/router';
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
  public errors = false

  constructor(
    private apiService: ApiService,
  ) { }

  ngOnInit() {
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
  }

  onSubmit() {
    if (this.saveForm.valid) {
      this.loading = true;

      this.apiService.save(Utils.urls.contact, this.saveForm.value).subscribe({
        next: (data: any) => {

          this.saveForm.reset();

          // this.router.navigate(['/', 'verify', data.user.id]);

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
