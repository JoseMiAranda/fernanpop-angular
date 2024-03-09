import { Routes } from '@angular/router';
import { HomeComponent } from './fernanpop/pages/home/home.component';
import { LoginComponent } from './fernanpop/pages/auth/login/login.component';
import { RegisterComponent } from './fernanpop/pages/auth/register/register.component';
import { InfoProductComponent } from './fernanpop/pages/products/info-product/info-product.component';
import { ErrorComponent } from './fernanpop/pages/error/error.component';
import { SearchProductComponent } from './fernanpop/pages/products/search-product/search-product.component';
import { loggedUserGuard } from './guards/logged-user.guard';

export const routes: Routes = [
    {
        path: 'fernanpop',
        loadComponent: () => import('./fernanpop/fernanpop.component').then(c => c.FernanpopComponent),
        children: [
            {
                path: '',
                title: 'home',
                loadComponent: () => HomeComponent,
            },
            {
                path: 'product/:id',
                title: 'product',
                loadComponent: () => InfoProductComponent,
            },
            {
                path: 'products',
                title: 'products',
                loadComponent: () => SearchProductComponent,
            },
            {
                canActivate: [loggedUserGuard],
                path: 'login',
                title: 'login',
                loadComponent: () => LoginComponent,
            },
            {
                canActivate: [loggedUserGuard],
                path: 'register',
                title: 'register',
                loadComponent: () => RegisterComponent,
            },
            {
                path: 'error',
                title: 'error',
                loadComponent: () => ErrorComponent,
            },
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full',
            }            
        ]
    }, 
    {
        path: '**',
        redirectTo: '/fernanpop',
        pathMatch: 'full',
    }
];
