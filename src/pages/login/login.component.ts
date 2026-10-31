import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';
import { AuthenticationService } from '../../apiConnection/authentication.service';
import { LoadingComponent } from '../../components/loading/loading.component';
import { SocialNetworkAccessComponent } from '../../components/socialNetworkAccess/socialNetworkAccess.component';

@Component({
  imports: [
    LoadingComponent,
    SocialNetworkAccessComponent,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loading = false;

  login = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  error = false;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private cdr: ChangeDetectorRef
  ) {
    if (localStorage.getItem('currentUser')) {
      // return to home if user is logged
      this.router.navigate(['/']);
    }
  }

  onSubmit() {
    if (this.login.valid) {
      this.loading = true;

      const { email, password } = this.login.value;

      this.authenticationService.login(email, password).subscribe({
        next: data => {

          this.router.navigate([this.authenticationService.consumeReturnUrl()])

        },
        error: (error: any) => {
          // right password but the email isn't verified yet: send them to enter the code
          if (error?.user?.id) {
            this.router.navigate(['/verify', error.user.id]);
            return;
          }

          this.error = true;
          this.loading = false;
          this.cdr.markForCheck();
        }
      })

    } else {
      this.error = true;
    }
  }
}
