import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

// Importar todos los iconos utilizados en la aplicación
import {
  faHeart,
  faGear,
  faList,
  faListUl,
  faUser,
  faUsers,
  faEnvelope,
  faArrowRightFromBracket,
  faRightToBracket,
  faCrown,
  faXmark,
  faCircleCheck,
  faBasketShopping,
  faPen,
  faTrashCan,
  faAngleLeft,
  faAngleRight,
  faArrowLeft,
  faArrowRight,
  faRotate,
  faCopy,
  faShareNodes,
  faFaceFrown,
  faCheck,
  faSignInAlt,
  faSignOutAlt,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faStar,
  faPalette
} from '@fortawesome/free-solid-svg-icons';

import {
  faFaceFrown as farFaceFrown,
  faCopyright
} from '@fortawesome/free-regular-svg-icons';

import {
  faGithub,
  faGoogle,
  faSteam,
  faAmazon,
  faFacebook,
  faAngular
} from '@fortawesome/free-brands-svg-icons';

export function configureFontAwesome(library: FaIconLibrary): void {
  // Agregar iconos solid
  library.addIcons(
    faHeart,
    faGear,
    faList,
    faListUl,
    faUser,
    faUsers,
    faEnvelope,
    faArrowRightFromBracket,
    faRightToBracket,
    faCrown,
    faXmark,
    faCircleCheck,
    faBasketShopping,
    faPen,
    faTrashCan,
    faAngleLeft,
    faAngleRight,
    faArrowLeft,
    faArrowRight,
    faRotate,
    faCopy,
    faShareNodes,
    faFaceFrown,
    faCheck,
    faSignInAlt,
    faSignOutAlt,
    faChevronDown,
    faChevronLeft,
    faChevronRight,
    faStar,
    faPalette
  );

  // Agregar iconos regular
  library.addIcons(
    farFaceFrown,
    faCopyright
  );

  // Agregar iconos brands
  library.addIcons(
    faGithub,
    faGoogle,
    faSteam,
    faAmazon,
    faFacebook,
    faAngular
  );
}
