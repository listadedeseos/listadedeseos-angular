import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  imports: [
    RouterModule,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './page-logged.component.html',
  styleUrl: './page-logged.component.scss',
})
export class PageLoggedComponent {
}
