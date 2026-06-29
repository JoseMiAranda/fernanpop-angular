import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TitleComponent } from '../title/title.component';
import { SearcherComponent } from '../searcher/searcher.component';
import { DropdownMenuComponent } from '../ui/dropdown-menu/dropdown-menu.component';
import { DropdownMenuItem } from '../ui/dropdown-menu/dropdown-menu-item.model';
import { ButtonComponent } from '../ui/button/button.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TitleComponent, SearcherComponent, DropdownMenuComponent, ButtonComponent],
  templateUrl: './navbar.component.html',
  styles: ``
})
export class NavbarComponent implements OnInit {
  currentUser = this.authService.currentUser;
  items = signal<DropdownMenuItem[]>([]);

  windowWidth: number = window.innerWidth;
  md: number = 768; 

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (!user) {
        this.items.set([]);
        return;
      }

      this.items.set([
        {
          label: 'Productos',
          icon: 'box',
          action: () => this.router.navigate(['/user/products']),
        },
        {
          label: 'Mi perfil',
          icon: 'user',
          action: () => this.router.navigate(['/seller', user.uid]),
        },
        {
          label: 'Favoritos',
          icon: 'heart',
          action: () => this.router.navigate(['/user/favorites']),
        },
        {
          label: 'Mensajes',
          icon: 'message',
          action: () => this.router.navigate(['/user/messages']),
        },
        {
          label: 'Editar perfil',
          icon: 'user',
          action: () => this.router.navigate(['/user/profile']),
        },
        {
          label: 'Transacciones',
          icon: 'truck',
          action: () => this.router.navigate(['/user/transactions']),
        },
        {
          label: 'Cerrar sesión',
          icon: 'sign-out',
          action: () => this.logout(),
        },
      ]);
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.windowWidth = window.innerWidth;
  }

  apperarBottomSearcher(): boolean {
    return this.windowWidth < this.md;
  }

  userDisplayName(): string | null {
    const user = this.currentUser();
    if (!user) {
      return null;
    }

    if (user.displayName?.trim()) {
      return user.displayName.trim();
    }

    return user.email.split('@')[0];
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
