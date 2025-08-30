import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { Utils } from './utils/utils';

bootstrapApplication(App, appConfig)
  .then(appRef => {
    // Set up global injector for utilities
    Utils.setGlobalInjector(appRef.injector);
  })
  .catch((err) => console.error(err));
