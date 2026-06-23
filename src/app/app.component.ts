import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { FavoritesService } from './services/favorites.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {

  authService = inject(AuthService);
  favoritesService = inject(FavoritesService);
  private router = inject(Router);
  private routerSubscription?: Subscription;

  title = 'fernanpop';

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.authService.currentUser.set({
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName ?? undefined,
          photoUrl: user.photoURL ?? undefined,
        });

        void this.authService.refreshAccessToken().then(() => {
          this.favoritesService.loadFavoriteIds();
        });
      } else {
        this.authService.clearAccessToken();
        this.authService.currentUser.set(null);
        this.favoritesService.clearFavorites();
      }
    });

    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.authService.currentUser()) {
          void this.authService.refreshAccessToken();
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

}
