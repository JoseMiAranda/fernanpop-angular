import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

import { provideHttpClient } from '@angular/common/http';
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";

import * as firebaseCredentials from '../../firebase.json';

import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';

export const appConfig: ApplicationConfig = {
  providers: [
    // Control de rutas y sus parámteros
    provideRouter(routes, withComponentInputBinding()), 
    // Para peticiones Http
    provideHttpClient(),
    // Para perimitir las animaciones
    provideAnimationsAsync(),
    // Para las animaciones de Netlify
    provideLottieOptions({
      player: () => player,
    }),
    // Obtenemos el auth de Firebase
    importProvidersFrom(provideFirebaseApp(() => initializeApp(firebaseCredentials))), importProvidersFrom(provideAuth(() => getAuth())
  )]
};


