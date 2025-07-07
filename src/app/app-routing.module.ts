import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../apiConnection/AuthGuard';

import { PageLoggedComponent } from '../components/page-logged/page-logged.component';
import { SocialNetworkGoogleCallbackComponent } from '../pages/social-network/google-callback/social-network.google-callback.component';
import { DashboardComponent } from '../pages/dashboard/dashboard.component';
import { LoginComponent } from '../pages/login/login.component';
import { UserComponent } from '../pages/user/user.component';
import { RegisterComponent } from '../pages/register/register.component';
import { VerifyComponent } from '../pages/verify/verify.component';
import { WishListComponent } from '../pages/wish-list/wish-list.component';
import { ContactComponent } from '../pages/contact/contact.component';
import { ContactListComponent } from '../pages/contact/contact-list/contact-list.component';
import { SteamPage } from '../pages/steam/steam.component';
import { AmazonPage } from '../pages/amazon/amazon.component';

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
      { path: 'list/:uuid/steam', component: SteamPage },
      { path: 'list/:uuid/amazon', component: AmazonPage },
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
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
