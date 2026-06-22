import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { FavoritesService } from './services/favorites.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  authService = inject(AuthService);
  favoritesService = inject(FavoritesService);

  title = 'fernanpop';

  ngOnInit(): void {
    this.authService.user$.subscribe(async (user) => {
      if (user) {
        const token = await user?.getIdToken();
        this.authService.currentUser.set({
          uid: user.uid,
          email: user.email!,
          accessToken: token,
        });
        this.favoritesService.loadFavoriteIds();
      } else {
        this.authService.currentUser.set(null);
        this.favoritesService.clearFavorites();
      }
    });
  }

}
