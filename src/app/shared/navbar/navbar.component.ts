import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TitleComponent } from '../title/title.component';
import { SearcherComponent } from '../searcher/searcher.component';
import { DropdownMenuComponent } from '../ui/dropdown-menu/dropdown-menu.component';
import { DropdownMenuItem } from '../ui/dropdown-menu/dropdown-menu-item.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TitleComponent, SearcherComponent, DropdownMenuComponent],
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
    this.authService.user$.subscribe(async (user) => {
      const menuItems: DropdownMenuItem[] = [
        {
          label: 'Productos',
          icon: 'box',
          action: () => this.router.navigate(['fernanpop/user/products']),
        },
        {
          label: 'Transacciones',
          icon: 'truck',
          action: () => this.router.navigate(['fernanpop/user/transactions']),
        },
      ];

      if (!user) {
        menuItems.push({
          label: 'Iniciar sesión',
          icon: 'sign-in',
          action: () => this.router.navigate(['fernanpop/login']),
        });
      } else {
        menuItems.push({
          label: 'Cerrar sesión',
          icon: 'sign-out',
          action: () => this.logout(),
        });
      }
      this.items.set(menuItems);
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.windowWidth = window.innerWidth;
  }

  apperarBottomSearcher(): boolean {
    return this.windowWidth < this.md;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['fernanpop']);
  }
}
