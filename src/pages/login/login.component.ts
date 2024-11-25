import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';

@Component({
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  login = new FormGroup({
    email: new FormControl('',[Validators.required, Validators.email]),
    password: new FormControl('',[Validators.required])
    });

  error = false;

  constructor(
    private router: Router,
    private apiService: ApiService
    ) {
      if(localStorage.getItem('user')){
        // return to home if user is logged
        this.router.navigate(['/']);
      }
    }

  onSubmit() {
    if(this.login.valid){

      this.apiService.postPetition(Utils.urls.login, this.login.value).subscribe({
        next: (data: any)=>{
          data.user.token = data.token;
          localStorage.setItem('user', JSON.stringify(data.user));
          this.router.navigate([sessionStorage.getItem('returnUrl')??'/']);
        },
        error: ()=>{
          this.error = true
        }
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
