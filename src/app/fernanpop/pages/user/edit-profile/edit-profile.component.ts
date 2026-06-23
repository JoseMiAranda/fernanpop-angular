import { CommonModule, Location } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { AuthService } from '../../../../services/auth.service';
import { ImagesService } from '../../../../services/images.service';
import { ErrorResponse, SuccessResponse } from '../../../../interfaces/response-interface';
import { ErrorState, InitialState, LoadingState, State, SuccessState } from '../../../../states/state.interface';
import {
  ButtonComponent,
  CardComponent,
  EyebrowComponent,
  PageContainerComponent,
  PageTitleComponent,
  TextComponent,
} from '../../../../shared/ui';
import { ImageDropComponent } from '../../../components/image-drop/image-drop.component';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    EyebrowComponent,
    PageContainerComponent,
    PageTitleComponent,
    TextComponent,
    ImageDropComponent,
  ],
  templateUrl: './edit-profile.component.html',
})
export class EditProfileComponent implements OnInit, OnDestroy {
  public pageState = signal<State>(new LoadingState());
  public saveState = signal<State>(new InitialState());
  public currentPhotoUrl = signal<string | undefined>(undefined);
  public previewUrl = signal<string | undefined>(undefined);
  public submitted = false;
  public isLoading = false;
  public errorMessage = signal<string | undefined>(undefined);

  private selectedFile: File | null = null;
  private objectUrl: string | null = null;

  form: FormGroup = new FormGroup({
    firstName: new FormControl(null),
    lastName: new FormControl(null),
    email: new FormControl({ value: null, disabled: true }),
  });

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private imagesService: ImagesService,
    private router: Router,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.authService.user$
      .pipe(
        filter((user) => user !== null),
        take(1),
      )
      .subscribe((firebaseUser) => {
        if (!firebaseUser) {
          this.pageState.set(new ErrorState('not-authenticated'));
          return;
        }

        const { firstName, lastName } = AuthService.parseDisplayName(firebaseUser.displayName ?? '');

        this.currentPhotoUrl.set(AuthService.resolvePhotoUrl(firebaseUser));
        this.form = this.formBuilder.group({
          firstName: [firstName || null, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
          lastName: [lastName || null, [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
          email: [{ value: firebaseUser.email, disabled: true }],
        });

        this.pageState.set(new SuccessState(null));
      });
  }

  ngOnDestroy(): void {
    this.revokePreviewUrl();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get displayInitials(): string {
    const firstName = this.form.get('firstName')?.value ?? '';
    const lastName = this.form.get('lastName')?.value ?? '';
    return this.buildInitials(`${firstName} ${lastName}`.trim());
  }

  get avatarUrl(): string | undefined {
    return this.previewUrl() ?? this.currentPhotoUrl();
  }

  onPhotoSelected(files: FileList): void {
    const file = files[0];
    if (!file) {
      return;
    }

    this.revokePreviewUrl();
    this.selectedFile = file;
    this.objectUrl = URL.createObjectURL(file);
    this.previewUrl.set(this.objectUrl);
  }

  goBack(): void {
    this.location.back();
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    this.errorMessage.set(undefined);

    if (this.form.invalid || this.isLoading) {
      return;
    }

    const user = this.authService.currentUser();
    if (!user) {
      this.errorMessage.set('No hay usuario autenticado');
      return;
    }

    this.isLoading = true;
    this.saveState.set(new LoadingState());

    try {
      let photoURL: string | undefined = this.currentPhotoUrl();

      if (this.selectedFile) {
        const uploadResponse = await firstValueFrom(this.imagesService.upload(this.selectedFile));

        if (uploadResponse instanceof ErrorResponse) {
          this.errorMessage.set('No se pudo subir la imagen. Inténtalo de nuevo.');
          this.saveState.set(new InitialState());
          this.isLoading = false;
          return;
        }

        photoURL = (uploadResponse as SuccessResponse).data;
      }

      const { firstName, lastName } = this.form.getRawValue();
      const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();

      await firstValueFrom(this.authService.updateUserProfile(displayName, photoURL));

      this.saveState.set(new SuccessState(null));
      this.router.navigate(['/seller', user.uid]);
    } catch {
      this.errorMessage.set('No se pudieron guardar los cambios. Inténtalo de nuevo.');
      this.saveState.set(new InitialState());
      this.isLoading = false;
    }
  }

  private buildInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  private revokePreviewUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.previewUrl.set(undefined);
  }
}
