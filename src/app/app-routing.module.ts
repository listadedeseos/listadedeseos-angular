import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../apiConnection/AuthGuard';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../components/header/header.component';
import { PageLoggedComponent } from '../components/page-logged/page-logged.component';
import { FooterComponent } from '../components/footer/footer.component';

import { CustomTableComponent } from '../components/customTable/customTable.component';
import { CustomDeleteComponent } from '../components/customDelete/customDelete.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ClipboardModule } from '@angular/cdk/clipboard';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LoadingComponent } from '../components/loading/loading.component';
import { SocialNetworkAccessComponent } from '../components/socialNetworkAccess/socialNetworkAccess.component';
import { CustomModalComponent } from '../components/customModal/customModal.component';
import { WishlistFormComponent } from '../components/wishlist-form/wishlist-form.component';
import { ProductFormComponent } from '../components/product-form/product-form.component';

import { SteamComponent } from '../components/steam/steam.component';
import { AmazonComponent } from '../components/amazon/amazon.component';

import { SocialNetworkGoogleCallbackComponent } from '../pages/social-network/google-callback/social-network.google-callback.component';

import { DashboardComponent } from '../pages/dashboard/dashboard.component';
import { LoginComponent } from '../pages/login/login.component';
import { UserComponent } from '../pages/user/user.component';
import { RegisterComponent } from '../pages/register/register.component';
import { VerifyComponent } from '../pages/verify/verify.component';
import { WishListComponent } from '../pages/wish-list/wish-list.component';
import { ContactComponent } from '../pages/contact/contact.component';
import { ContactListComponent } from '../pages/contact/contact-list/contact-list.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify/:userId', component: VerifyComponent },
  
  { path: 'login-google/callback', component: SocialNetworkGoogleCallbackComponent },

  {
    path: '',
    component: PageLoggedComponent,
    children: [
      { path: 'dashboard', pathMatch: 'full', component: DashboardComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'list/:uuid', component: WishListComponent },
      { path: 'list/user/:username', component: WishListComponent },
      { path: 'list/user/:username/:wishListName', component: WishListComponent },
    ]
  },
  {
    path: '',
    canActivate: [AuthGuard],
    component: PageLoggedComponent,
    children: [
      { path: 'list', component: WishListComponent },
      { path: 'user', component: UserComponent },
      { path: 'contact/list', component: ContactListComponent },
      { path: '**', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  declarations: [
    PageLoggedComponent,
    HeaderComponent,
    FooterComponent,

    CustomTableComponent,
    CustomDeleteComponent,

    LoadingComponent,
    SocialNetworkAccessComponent,
    CustomModalComponent,
    WishlistFormComponent,
    ProductFormComponent,

    SteamComponent,
    AmazonComponent,

    SocialNetworkGoogleCallbackComponent,

    DashboardComponent,
    LoginComponent,
    RegisterComponent,
    VerifyComponent,
    UserComponent,
    WishListComponent,
    ContactComponent,
    ContactListComponent,
  ],
  imports: [
    RouterModule.forRoot(routes),
    HttpClientModule,

    FontAwesomeModule,

    ClipboardModule,

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
