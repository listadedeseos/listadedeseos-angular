import { ChangeDetectorRef, Component, Input, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../apiConnection/ApiService';
import { AuthenticationService } from '../../apiConnection/authentication.service';
import { Utils } from '../../utils/utils';
import { ThemeConfig } from '../../enum/theme';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalRef } from '@some-angular-utils/modal';

@Component({
  selector: 'app-wishlist-form',
  imports: [
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
  // Only admins can change a list's theme. The control stays in the form for everyone so the
  // current theme is sent back unchanged (the API sets theme to null when it's missing)
  public isAdmin = inject(AuthenticationService).isAdmin;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
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
        this.loading = false;
        this.cdr.markForCheck();
      },
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
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
          // ErrorInterceptor rethrows the API's `message`; the duplicate-name one is already in Spanish
          const message = error === 'Ya tienes otra lista con ese nombre'
            ? 'Ya tienes otra lista con ese nombre (o uno que genera el mismo enlace).'
            : 'No se ha podido guardar la lista. El nombre solo admite letras, números, espacios y guiones.';
          Utils.ToastUtils.error('Error', message);
          this.loading = false;
          this.cdr.markForCheck();
        },
      })
    } else {
      Utils.ToastUtils.error('Error', 'Debe completar todos los campos obligatorios.');
    }
  }

}
