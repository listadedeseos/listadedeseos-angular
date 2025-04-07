import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';
import { catchError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loading = false;

  login = new FormGroup({
    email: new FormControl('',[Validators.required, Validators.email]),
    password: new FormControl('',[Validators.required])
    });

  error = false;

  constructor(
    private router: Router,
    private apiService: ApiService
    ) {
      if(localStorage.getItem('currentUser')){
        // return to home if user is logged
        this.router.navigate(['/']);
      }
    }

  onSubmit() {
    if(this.login.valid){
      this.loading = true;
      this.apiService.save(Utils.urls.login, this.login.value).subscribe({
        next: (data: any)=>{
          data.user.token = data.token;
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          this.router.navigate([sessionStorage.getItem('returnUrl')??'/']);
        },
        error: (error: any)=>{
          
          if(error.user && error.user.id){
            this.router.navigate(['/', 'verify', error.user.id]);
          }

          this.loading = false;
          this.error = true
        },
       
      })
      // .then((data) => {
      //   data.user.token = data.token;
      //   localStorage.setItem('user', JSON.stringify(data.user));
      //   this.router.navigate([sessionStorage.getItem('returnUrl')??'/']);
      // })
      // .catch((error) => {
      //   this.error = true;
      // })

    }else{
      this.error = true;
    }
  }
}
