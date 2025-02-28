import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TitleComponent } from '../title/title.component';
import { SearcherComponent } from '../searcher/searcher.component';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ButtonModule, SplitButtonModule, TitleComponent, SearcherComponent, MenuModule],
  templateUrl: './navbar.component.html',
  styles: ``
})
export class NavbarComponent implements OnInit {
  currentUser = this.authService.currentUser;
  open: boolean = false;
  dropdownOpen: boolean = false;
  items = signal<MenuItem[]>([]);

  windowWidth: number = window.innerWidth;
  md: number = 768; 

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.user$.subscribe(async (user) => {
      const menuItems: MenuItem[] = [
        {
          label: 'Productos',
          icon: "pi pi-box",
          command: () => {
            this.router.navigate(['fernanpop/user/products'])
          }
        },
        {
          label: 'Transacciones',
          icon: "pi pi-truck",
          command: () => {
            this.router.navigate(['fernanpop/user/transactions'])
          }
        },
      ];

      if (!user) {
        menuItems.push({
          label: 'Iniciar sesión',
          icon: 'pi pi-fw pi-sign-in',
          command: () => {
            this.router.navigate(['fernanpop/login'])
          }
        });

      } else {
        menuItems.push({
          label: 'Cerrar sesión',
          icon: 'pi pi-fw pi-sign-out',
          command: () => {
            this.logout();
          }
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

  toggleMenu() {
    this.open = !this.open;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['fernanpop']);
  }
}
