import { Routes } from '@angular/router';
import { HomeComponent } from './fernanpop/pages/home/home.component';
import { LoginComponent } from './fernanpop/pages/auth/login/login.component';
import { RegisterComponent } from './fernanpop/pages/auth/register/register.component';
import { InfoProductComponent } from './fernanpop/pages/products/info-product/info-product.component';
import { ErrorComponent } from './fernanpop/pages/error/error.component';
import { SearchProductComponent } from './fernanpop/pages/products/search-product/search-product.component';
import { UserProductsComponent } from './fernanpop/pages/products/user-products/user-products.component';
import { NotLoggedGuard } from './guards/not-logged.guard';
import { LoggedGuard } from './guards/logged.guard';
import { CreateProductComponent } from './fernanpop/pages/products/create-product/create-product.component';
import { UpdateProductComponent } from './fernanpop/pages/products/update-product/update-product.component';

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
                // Solamente accesible está logueado
                canActivate: [LoggedGuard],
                path: 'user/products',
                title: 'user-products',
                loadComponent: () => UserProductsComponent,
            },
            {
                // Solamente accesible si no está logueado
                canActivate: [NotLoggedGuard],
                path: 'login',
                title: 'login',
                loadComponent: () => LoginComponent,
            },
            {
                // Solamente accesible si no está logueado
                canActivate: [NotLoggedGuard],
                path: 'register',
                title: 'register',
                loadComponent: () => RegisterComponent,
            },
            {
                // Solamente accesible si no está logueado
                canActivate: [LoggedGuard],
                path: 'create-product',
                title: 'create-product',
                loadComponent: () => CreateProductComponent,
            },
            {
                // Solamente accesible si no está logueado
                canActivate: [LoggedGuard],
                path: 'update-product/:id',
                title: 'update-product',
                loadComponent: () => UpdateProductComponent,
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
