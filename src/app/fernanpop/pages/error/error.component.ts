import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AnimationItem } from 'lottie-web';
import { LottieDirective, AnimationOptions } from 'ngx-lottie';
import { ButtonComponent, CardComponent, PageContainerComponent } from '../../../shared/ui';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [LottieDirective, RouterLink, ButtonComponent, CardComponent, PageContainerComponent],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorComponent {

  options: AnimationOptions = {
    path: '/assets/loties/explorer.json',
  };

  message: string = 'Parece que ha habido un error';

  constructor(private router: Router) { 
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { message: any };
    
    if (state) {
      this.message = state.message;
    } 
  }

  animationCreated(animationItem: AnimationItem): void {
    console.log(animationItem);
  }
 
}
