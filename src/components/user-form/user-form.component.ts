import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';
import { LoadingComponent } from '../loading/loading.component';
import { CustomModalComponent } from '../customModal/customModal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-user-form',
  imports: [
    LoadingComponent,
    CustomModalComponent,
    ReactiveFormsModule,
    FontAwesomeModule,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent {
  @Input() id = 0;
  @Output() closeFunction = new EventEmitter<any>();
  @Output() acceptFunction = new EventEmitter<any>();

  public loading = false
  public saveForm: FormGroup = new FormGroup({});
  public dropdowns: any = {}

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.createForm();

    if (this.id != 0) {
      this.getById(this.id);
      this.getWishLists();
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

      username: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      surname: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      role: new FormControl(''),
      password: new FormControl(''),
      main_wish_list_id: new FormControl('', [Validators.required]),

    })
  }

  getById(id: number) {
    this.loading = true;
    this.apiService.getById(Utils.urls.user, id).subscribe({
      next: (data: any) => {
        this.saveForm.patchValue(data.user);
      },
      error: (error: any) => {
        console.error('ERROR obtener productos. ' + error);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  getWishLists() {
    this.apiService.getById(Utils.urls.wishlistUser, this.id).subscribe({
      next: (value: any) => {
        this.dropdowns.wishlists = value.wishlists
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    })
  }

  saveEntity() {
    if (this.saveForm.valid) {
      this.loading = true;

      this.apiService.save(Utils.urls.user, this.saveForm.value, this.id).subscribe({
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
