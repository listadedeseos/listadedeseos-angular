import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../apiConnection/AuthGuard';
import { LoginComponent } from '../pages/login/login.component';
import { UserComponent } from '../pages/user/user.component';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../components/header/header.component';
import { PageLoggedComponent } from '../components/page-logged/page-logged.component';
import { FooterComponent } from '../components/footer/footer.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    canActivate: [AuthGuard],
    component: PageLoggedComponent,
    children: [
      { path: 'user', component: UserComponent },
      { path: '**', redirectTo: 'user' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  declarations: [
    PageLoggedComponent,
    HeaderComponent,
    FooterComponent,

    UserComponent,
  ],
  imports: [
    RouterModule.forRoot(routes),
    HttpClientModule,

    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    DatePipe,

  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
