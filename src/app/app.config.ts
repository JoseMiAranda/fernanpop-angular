import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

import { provideHttpClient } from '@angular/common/http';
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";

import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';

export const firebaseCredentials = {
  projectId: import.meta.env.PROJECT_ID,
  appId: import.meta.env.APP_ID,
  storageBucket: import.meta.env.STORAGE_BUCKET,
  apiKey: import.meta.env.API_KEY,
  authDomain: import.meta.env.AUTH_DOMAIN,
  messagingSenderId: import.meta.env.MESSAGING_SENDER_ID,
}

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


