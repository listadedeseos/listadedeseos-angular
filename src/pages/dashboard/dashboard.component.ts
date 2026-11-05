import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthenticationService } from '../../apiConnection/authentication.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HEADLINES } from './headlines';
import { IconName } from '@fortawesome/fontawesome-svg-core';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FontAwesomeModule,
    CommonModule,
    RouterModule,
  ],
})
export class DashboardComponent {

  public isLogged = false

  // ---- Static content for the landing sections ----

  // Hero title: one of the HEADLINES (see ./headlines.ts) picked at random on each page load
  public headline = HEADLINES[Math.floor(Math.random() * HEADLINES.length)]

  // Illustrative list shown in the hero (not real data)
  public previewItems: { name: string, price: string, icon: IconName, reserved: boolean }[] = [
    { name: 'Auriculares inalámbricos', price: '89,00 €', icon: 'headphones', reserved: false },
    { name: 'Libro de cocina italiana', price: '24,90 €', icon: 'book', reserved: true },
    { name: 'Juego de mesa', price: '39,95 €', icon: 'dice', reserved: false },
  ]


  public steps: { number: string, icon: IconName, who: string, title: string, text: string }[] = [
    {
      number: '01', icon: 'list-ul', who: 'Tú',
      title: 'Crea tu lista',
      text: 'Regístrate gratis y crea una lista para cada ocasión. Ponle nombre y, si quieres, una fecha límite: tus invitados verán la cuenta atrás.',
    },
    {
      number: '02', icon: 'cart-plus', who: 'Tú',
      title: 'Añade tus deseos',
      text: 'Nombre, precio, foto y enlace de la tienda. ¿Tienes una lista en Steam o Amazon? Vincúlala y sus productos aparecen solos.',
    },
    {
      number: '03', icon: 'share-nodes', who: 'Tú',
      title: 'Comparte el enlace',
      text: 'Copia tu enlace y mándalo por WhatsApp, email o donde quieras. Quien lo abra no necesita registrarse.',
    },
    {
      number: '04', icon: 'gift', who: 'Tus invitados',
      title: 'Reservan y regalan',
      text: 'Cada invitado marca como reservado lo que va a comprar y los demás lo ven al momento. Así nadie repite regalo.',
    },
  ]

  public ownerBenefits = [
    'Varias listas a la vez: cumpleaños, boda, Navidad…',
    'Tus tallas de ropa y calzado a la vista, para acertar a la primera.',
    'Puedes ocultar las reservas para no estropearte la sorpresa.',
    'Edita, reordena o borra productos cuando quieras.',
  ]

  public guestBenefits = [
    'Sin cuentas ni contraseñas: solo abrir el enlace.',
    'Ves qué está libre y qué ya ha reservado otra persona.',
    'Un clic para ir a la tienda y comprarlo.',
    'Las reservas son anónimas: nadie sabe quién regala qué.',
  ]

  public faqs = [
    {
      q: '¿Cuánto cuesta?',
      a: 'Nada. Crear listas, añadir productos y compartirlas es gratis.',
    },
    {
      q: '¿Mis invitados necesitan una cuenta?',
      a: 'No. Cualquiera con el enlace puede ver tu lista y reservar un regalo sin registrarse.',
    },
    {
      q: '¿Cómo es el enlace de mi lista?',
      a: 'Tu lista principal está en listadedeseos.es/@tu-usuario, y cada una de las demás en listadedeseos.es/@tu-usuario/nombre-de-la-lista.',
    },
    {
      q: '¿Puedo saber quién me ha reservado algo?',
      a: 'No: las reservas son anónimas. Verás qué está reservado, nunca quién lo va a regalar. Y si prefieres no saber ni eso, puedes ocultar las reservas.',
    },
    {
      q: 'He reservado algo por error, ¿qué hago?',
      a: 'Avisa a quien creó la lista: solo esa persona puede quitar una reserva, para que nadie libere por accidente el regalo de otro.',
    },
    {
      q: '¿Funciona con Steam y Amazon?',
      a: 'Sí. Vincula tu usuario de Steam o tu lista de deseos de Amazon a una lista y sus productos se muestran junto al resto, también reservables.',
    },
  ]

  constructor(
    private authenticationService: AuthenticationService,
  ) { 
    this.isLogged = this.authenticationService.isLogged
  }

}
