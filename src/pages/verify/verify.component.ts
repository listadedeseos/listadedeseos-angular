import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';
import { LoadingComponent } from '../../components/loading/loading.component';
import { CommonModule } from '@angular/common';

@Component({
  imports: [
    LoadingComponent,
    ReactiveFormsModule,
    CommonModule,
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
          data.user.token = data.token;
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          this.router.navigate([sessionStorage.getItem('returnUrl') ?? '/']);
        },
        error: () => {
          this.loading = false;
          this.error = true
        }
      })

    } else {
      this.error = true;
    }
  }
}
