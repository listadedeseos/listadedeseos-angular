import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../apiConnection/ApiService';
import { AuthenticationService } from '../../apiConnection/authentication.service';
import { Utils } from '../../utils/utils';
import { LoadingComponent } from '../../components/loading/loading.component';


@Component({
  imports: [
    LoadingComponent,
    ReactiveFormsModule
],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.scss',
})
export class VerifyComponent {
  loading = false;

  userId = 0

  form: FormGroup = new FormGroup({});

  error = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private activateRoute: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private cdr: ChangeDetectorRef,
  ) {
    this.userId = this.activateRoute.snapshot.params['userId'] ?? null
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.form = new FormGroup({
      id: new FormControl(this.userId, [Validators.required]),
      security_code: new FormControl('', [Validators.required, Validators.minLength(4)]),
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.loading = true;
      this.apiService.save(Utils.urls.userVerify, this.form.value).subscribe({
        next: (data: any) => {
          this.authenticationService.setSession(data.user, data.token);
          this.router.navigate([this.authenticationService.consumeReturnUrl()]);
        },
        error: () => {
          this.loading = false;
          this.error = true
          this.cdr.markForCheck();
        }
      })

    } else {
      this.error = true;
    }
  }
}
