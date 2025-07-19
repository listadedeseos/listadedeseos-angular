import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

// Angular Material
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

// FontAwesome
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { configureFontAwesome } from './font-awesome.config';

// CDK
import { ClipboardModule } from '@angular/cdk/clipboard';

// App modules
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Interceptors
import { JwtInterceptor } from '../apiConnection/JwtInterceptor';
import { ErrorInterceptor } from '../apiConnection/ErrorInterceptor';

// Components
import { HeaderComponent } from '../components/header/header.component';
import { PageLoggedComponent } from '../components/page-logged/page-logged.component';
import { FooterComponent } from '../components/footer/footer.component';
import { CardComponent } from '../components/card/card.component';
import { CustomTableComponent } from '../components/customTable/customTable.component';
import { CustomDeleteComponent } from '../components/customDelete/customDelete.component';
import { LoadingComponent } from '../components/loading/loading.component';
import { SocialNetworkAccessComponent } from '../components/socialNetworkAccess/socialNetworkAccess.component';
import { CustomModalComponent } from '../components/customModal/customModal.component';
import { WishlistFormComponent } from '../components/wishlist-form/wishlist-form.component';
import { ProductFormComponent } from '../components/product-form/product-form.component';
import { SteamComponent } from '../components/steam/steam.component';
import { AmazonComponent } from '../components/amazon/amazon.component';

// Pages
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

@NgModule({
  declarations: [
    AppComponent,
    
    // Layout Components
    PageLoggedComponent,
    HeaderComponent,
    FooterComponent,

    // UI Components
    CardComponent,
    CustomTableComponent,
    CustomDeleteComponent,
    LoadingComponent,
    SocialNetworkAccessComponent,
    CustomModalComponent,
    WishlistFormComponent,
    ProductFormComponent,
    SteamComponent,
    AmazonComponent,

    // Pages
    SocialNetworkGoogleCallbackComponent,
    DashboardComponent,
    LoginComponent,
    RegisterComponent,
    VerifyComponent,
    UserComponent,
    WishListComponent,
    ContactComponent,
    ContactListComponent,
    SteamPage,
    AmazonPage,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    
    // Forms
    FormsModule,
    ReactiveFormsModule,
    
    // HTTP
    HttpClientModule,
    
    // Material
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    
    // External
    FontAwesomeModule,
    ClipboardModule,
  ],
  providers: [
    DatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(library: FaIconLibrary) {
    configureFontAwesome(library);
  }
}
