import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../apiConnection/authentication.service';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';
import { User } from '../../apiConnection/model/user';
import { LoadingComponent } from '../../components/loading/loading.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-profile',
    imports: [
        LoadingComponent,
        ReactiveFormsModule,
        CommonModule,
        RouterLink
    ],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
    profileForm: FormGroup;
    loading = false;
    submitted = false;
    error = '';
    success = '';
    currentUser: User;
    showPasswordField = false;
    wishlists: any;

    constructor(
        private formBuilder: FormBuilder,
        public router: Router,
        private authenticationService: AuthenticationService,
        private apiService: ApiService,
        private cdr: ChangeDetectorRef,
    ) {
        this.currentUser = this.authenticationService.currentUserValue;

        this.profileForm = this.formBuilder.group({
            username: [this.currentUser?.username || '', [Validators.required, Validators.minLength(3)]],
            name: ['', [Validators.required, Validators.minLength(2)]],
            surname: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            main_wish_list_id: [-1, [Validators.required]],
            password: [''],
            confirmPassword: ['']
        }, { validator: this.passwordMatchValidator });
    }

    ngOnInit(): void {
        this.loadUserProfile();
    }

    passwordMatchValidator(form: FormGroup) {
        const password = form.get('password');
        const confirmPassword = form.get('confirmPassword');

        if (password?.value && confirmPassword?.value && password.value !== confirmPassword.value) {
            confirmPassword?.setErrors({ passwordMismatch: true });
        } else if (confirmPassword?.errors?.['passwordMismatch']) {
            delete confirmPassword.errors['passwordMismatch'];
            if (Object.keys(confirmPassword.errors).length === 0) {
                confirmPassword.setErrors(null);
            }
        }
        return null;
    }

    get f() { return this.profileForm.controls; }

    loadUserProfile(): void {
        this.loading = true;
        this.apiService.getPetition(Utils.urls.user + '/current').subscribe({
            next: (response: any) => {
                const userData = response.user;
                this.profileForm.patchValue(userData);
                this.getWishLists();
            },
            error: (error) => {
                console.error('Error loading user profile:', error);
                this.error = 'No se pudo cargar la información del perfil';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    togglePasswordField(): void {
        this.showPasswordField = !this.showPasswordField;
        if (!this.showPasswordField) {
            this.profileForm.patchValue({
                password: '',
                confirmPassword: ''
            });
        }
    }

    onSubmit(): void {
        this.submitted = true;
        this.error = '';
        this.success = '';

        if (this.profileForm.invalid) {
            return;
        }

        this.loading = true;

        const formData = { ...this.profileForm.value };

        // Remove password fields if not updating password
        if (!this.showPasswordField || !formData.password) {
            delete formData.password;
            delete formData.confirmPassword;
        } else {
            delete formData.confirmPassword;
        }

        this.apiService.save(Utils.urls.user, formData, 'current').subscribe({
            next: (response: any) => {
                this.success = 'Perfil actualizado correctamente';
                this.loading = false;
                this.cdr.detectChanges();
                this.submitted = false;

                // Crear el fullName combinando name y surname
                const fullName = `${formData.name} ${formData.surname}`.trim();

                // Update the current user data with new information
                const updatedUser: User = {
                    ...this.currentUser,
                    username: formData.username,
                    fullName: fullName
                };

                // Si la respuesta incluye información adicional del usuario, usarla
                if (response && response.user) {
                    Object.assign(updatedUser, response.user);
                } else if (response && response.data) {
                    Object.assign(updatedUser, response.data);
                }

                // Update localStorage
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));

                // Update the authentication service current user
                this.authenticationService['currentUserSubject'].next(updatedUser);

                // Update local reference
                this.currentUser = updatedUser;

                // Hide password field after successful update
                if (this.showPasswordField) {
                    this.togglePasswordField();
                }

                // Scroll to top to show success message
                window.scrollTo({ top: 0, behavior: 'smooth' });

                Utils.ToastUtils.success('Perfil actualizado', 'Tu perfil ha sido actualizado correctamente.');

                this.router.navigate(['/']);
            },
            error: (error) => {
                this.error = error.error?.message || 'Error al actualizar el perfil. Inténtalo de nuevo.';
                this.loading = false;
                this.cdr.detectChanges();

                // Scroll to top to show error message
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    getWishLists() {
        this.apiService.getPetition(Utils.urls.wishlist).subscribe({
            next: (value: any) => {
                this.wishlists = value.wishlists
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.error = 'No se pudieron cargar las listas de deseos';
                this.loading = false;
                this.cdr.detectChanges();
            },
        })
    }
}