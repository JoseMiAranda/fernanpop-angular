import { Routes } from '@angular/router';
import { HomeComponent } from './fernanpop/pages/home/home.component';
import { LoginComponent } from './fernanpop/pages/auth/login/login.component';
import { RegisterComponent } from './fernanpop/pages/auth/register/register.component';
import { InfoProductComponent } from './fernanpop/pages/products/info-product/info-product.component';
import { ErrorComponent } from './fernanpop/pages/error/error.component';
import { SearchProductComponent } from './fernanpop/pages/products/search-product/search-product.component';
import { UserProductsComponent } from './fernanpop/pages/products/user-products/user-products.component';
import { authGuard } from './guards/auth.guard';

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
                path: 'user/products',
                title: 'user-products',
                loadComponent: () => UserProductsComponent,
            },
            {
                // Solamente accesible si no está logueado
                canActivate: [authGuard],
                path: 'login',
                title: 'login',
                loadComponent: () => LoginComponent,
            },
            {
                // Solamente accesible si no está logueado
                canActivate: [authGuard],
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
