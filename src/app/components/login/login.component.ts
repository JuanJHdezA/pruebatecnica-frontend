import { Component, inject, OnInit, signal } from '@angular/core';
import { PrimeNGModule } from '../../core/modules/primeng.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from './services/login.service';
import { Router, RouterLink } from '@angular/router';
import { CustomPasswordComponent } from '../custom-password/custom-password.component';
import { loginValidationConst as Validation } from './const/login.const';
import { AuthUser } from './interfaces/login.services.interface';
import { ResponseInterface } from 'src/app/core/interfaces/response.interface';

@Component({
  selector: 'app-login',
  imports: [PrimeNGModule, CustomPasswordComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  public login: FormGroup = new FormGroup({});
  public error = { show: false, mns: '' };

  public loading = signal<boolean>(false);

  // Inyección moderna de Angular
  private loginService = inject(LoginService);
  private _router = inject(Router);

  constructor() {
    this.crearFormulario();
  }

  ngOnInit(): void {
    console.clear();
  }

  // Helper para facilitar la lectura en el HTML
  get f() {
    return this.login.controls;
  }

  private crearFormulario(data?: { usuario?: string; password?: string }) {
    this.login = new FormGroup({
      email: new FormControl(data?.usuario ?? 'usuarioprueba', [Validators.required]),
      password: new FormControl(data?.password ?? 'temporal', [Validators.required])
    });
  }

  public async ingresar(event?: Event) {
    try {
      this.error = { show: false, mns: '' };
      if (this.login.status === 'INVALID') {
        // Este método es recursivo: marca el form y TODOS sus hijos (incluyendo tu componente custom)
        this.login.markAllAsTouched();

        // Opcional: forzar a Angular a que detecte el cambio de estado inmediatamente
        this.login.updateValueAndValidity();
        return;
      }

      /* Loading */
      this.loading.set(true);
      this.activateForm(true);
      this.login.disable();

      let login = {
        usuario: this.login.value['email']?.toLowerCase()?.trim(),
        password: this.login.value['password']?.trim()
      };

      this.error = { show: false, mns: '' };

      const auth = await this.loginService.solicitarAcceso(login);
      this.loading.set(false);

      if (!auth.success) {
        this.mnsValidationError(auth);
        this.crearFormulario({ usuario: login.usuario });
        return;
      }

      console.log(auth?.data?.code);

      if (auth?.data?.code === 'USUARIO_NOVALIDO') {
        this.error = {
          show: true,
          mns: Validation[auth?.data?.code] ?? 'Servicio no disponible'
        };

        this.crearFormulario({ usuario: login.usuario });
        return;
      }

      this._router.navigateByUrl('control/bienvenida').then();
    } catch (error) {
      /* **** */
      /* Crear mensaje global de aplicación */
      /* **** */

      this.crearFormulario();
    }
  }

  private activateForm(active: boolean) {
    if (active) {
      //Propiedades del formulario
      this.login.get('usuario')?.enable();
      this.login.get('password')?.enable();

      return;
    }

    //Propiedades del formulario
    this.login.get('usuario')?.disable();
    this.login.get('password')?.disable();
  }

  private mnsValidationError(res: ResponseInterface<AuthUser>) {
    this.loading.set(false);

    this.error = { show: false, mns: '' };
    this.activateForm(false);

    if (res?.codeError === '00') {
      const code = res?.errors?.message ?? 'ERR_001';
      const message = Validation[code] ?? null;

      if (message) {
        this.error = {
          show: true,
          mns: Validation[code]
        };

        return;
      }
    }

    this.error = {
      show: true,
      mns: 'Servicio no disponible'
    };
  }
}
