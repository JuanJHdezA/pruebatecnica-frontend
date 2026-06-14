import {
  ApplicationConfig,
  importProvidersFrom,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import localeEs from '@angular/common/locales/es-MX';
import { definePreset } from '@primeuix/themes';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { RequestInterceptor } from './core/interceptors/request/request.interceptor';
import { ResponseInterceptor } from './core/interceptors/response/response.interceptor';
import { JwtModule } from '@auth0/angular-jwt';
import { environment } from '../environment/environment';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MessageService } from 'primeng/api';

//Registrar los datos de español
registerLocaleData(localeEs);

const color: string = 'emerald';
const theme = definePreset(Aura, {
  semantic: {
    primary: {
      50: `{${color}.50}`,
      100: `{${color}.100}`,
      200: `{${color}.200}`,
      300: `{${color}.300}`,
      400: `{${color}.400}`,
      500: `{${color}.500}`,
      600: `{${color}.600}`,
      700: `{${color}.700}`,
      800: `{${color}.800}`,
      900: `{${color}.900}`,
      950: `{${color}.950}`
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(withEventReplay()),
    providePrimeNG({
      theme: { preset: Aura, options: { palette: 'emerald', prefix: 'p', darkModeSelector: 'none' } },
      translation: {
        dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
        dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
        monthNames: [
          'Enero',
          'Febrero',
          'Marzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Septiembre',
          'Octubre',
          'Noviembre',
          'Diciembre'
        ],
        monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        today: 'Hoy',
        clear: 'Limpiar',
        firstDayOfWeek: 1,
        dateFormat: 'dd/mm/yy'
      }
    }),
    provideHttpClient(withInterceptors([RequestInterceptor, ResponseInterceptor])),
    MessageService,
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: () => '',
          allowedDomains: [environment.DOMAIN],
          disallowedRoutes: [`${environment.DOMAIN}/login`]
        }
      })
    ),
  ]
};
