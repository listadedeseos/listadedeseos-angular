import { NgModule } from '@angular/core';
import { RouterModule, Routes, UrlMatcher, UrlSegment } from '@angular/router';
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
import { ProfileComponent } from '../pages/profile/profile.component';

const userMatcher: UrlMatcher = (segments: UrlSegment[]) => {
  if (segments[0].path.startsWith('@')) {
    const username = segments[0].path.substring(1); // Remover el @

    if (!username.trim()) {
      return null; // redirect to dashboard
    }

    const consumedSegments = segments.length >= 2 ? [segments[0], segments[1]] : [segments[0]];
    const wishListName = segments[1] ? segments[1].path : null;

    return {
      consumed: consumedSegments,
      posParams: {
        username: new UrlSegment(username, {}),
        ...(wishListName && { wishListName: new UrlSegment(wishListName, {}) }) // empty if wishlist is undefined
      }
    };
  }
  return null; // redirect to dashboard
};

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify/:userId', component: VerifyComponent },

  { path: 'login-google/callback', component: SocialNetworkGoogleCallbackComponent },

  {
    matcher: userMatcher,
    component: PageLoggedComponent,
    children: [
      { path: '', component: WishListComponent }, // @username
      { path: ':wishListName', component: WishListComponent }, // @username/list
    ]
  },

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
      { path: 'profile', component: ProfileComponent },
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
