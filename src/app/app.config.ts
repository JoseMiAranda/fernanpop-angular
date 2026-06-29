import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";

import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';

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
    provideHttpClient(withInterceptors([authInterceptor])),
    // Para perimitir las animaciones
    provideAnimationsAsync(),
    // Para las animaciones de Netlify
    provideLottieOptions({
      player: () => player,
    }),
    // Obtenemos el auth de Firebase
    importProvidersFrom(provideFirebaseApp(() => initializeApp(firebaseCredentials))),
    importProvidersFrom(provideFirestore(() => getFirestore())),
    importProvidersFrom(
      provideAuth(() => {
        const auth = getAuth();
        auth.languageCode = 'es';
        return auth;
      }),
    ),
  ]
};


