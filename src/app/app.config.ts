import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

import { provideHttpClient } from '@angular/common/http';
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";

import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';

console.log({...import.meta.env});

export const firebaseCredentials = {
  projectId: import.meta.env.NG_APP_PROJECT_ID,
  appId: import.meta.env.NG_APP_APP_ID,
  storageBucket: import.meta.env.NG_APP_STORAGE_BUCKET,
  apiKey: import.meta.env.NG_APP_API_KEY,
  authDomain: import.meta.env.NG_APP_AUTH_DOMAIN,
  messagingSenderId: import.meta.env.NG_APP_MESSAGING_SENDER_ID,
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


