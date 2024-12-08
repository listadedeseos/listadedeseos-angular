import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../apiConnection/AuthGuard';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../components/header/header.component';
import { PageLoggedComponent } from '../components/page-logged/page-logged.component';
import { FooterComponent } from '../components/footer/footer.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CustomModalComponent } from '../components/customModal/customModal.component';
import { ProductFormComponent } from '../components/product-form/product-form.component';

import { LoginComponent } from '../pages/login/login.component';
import { UserComponent } from '../pages/user/user.component';
import { RegisterComponent } from '../pages/register/register.component';
import { WishListComponent } from '../pages/wish-list/wish-list.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'list' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: PageLoggedComponent,
    children: [
      { path: 'list/:username', component: WishListComponent },
      { path: 'list/:username/:wishListName', component: WishListComponent },
    ]
  },
  {
    path: '',
    canActivate: [AuthGuard],
    component: PageLoggedComponent,
    children: [
      { path: 'list', component: WishListComponent },
      { path: 'user', component: UserComponent },
      { path: '**', redirectTo: 'list' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  declarations: [
    PageLoggedComponent,
    HeaderComponent,
    FooterComponent,

    CustomModalComponent,
    ProductFormComponent,

    LoginComponent,
    RegisterComponent,
    UserComponent,
    WishListComponent,
  ],
  imports: [
    RouterModule.forRoot(routes),
    HttpClientModule,

    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    DatePipe,
    CommonModule,

    FormsModule, ReactiveFormsModule,

  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
