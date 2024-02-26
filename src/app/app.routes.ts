import { Routes } from '@angular/router';
import { HomeComponent } from './fernanpop/pages/home/home.component';
import { SearchProductComponent } from './fernanpop/pages/products/search-product/search-product.component';
import { InfoProductComponent } from './fernanpop/pages/products/info-product/info-product.component';
import { LoginComponent } from './fernanpop/pages/auth/login/login.component';
import { RegisterComponent } from './fernanpop/pages/auth/register/register.component';

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
                path: 'products/search/:queryParams',
                title: 'products',
                loadComponent: () => SearchProductComponent,
            },
            {
                path: 'product/:id',
                title: 'product',
                loadChildren: () => InfoProductComponent,
            },
            {
                path: 'login',
                title: 'login',
                loadComponent: () => LoginComponent,
            },
            {
                path: 'register',
                title: 'register',
                loadComponent: () => RegisterComponent,
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
