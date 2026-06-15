# 🚀 Frontend Prueba Técnica - Grupo Salinas

Este proyecto es la solución frontend para la prueba técnica de Grupo Salinas. Es una aplicación web robusta construida con **Angular 21**, diseñada bajo una arquitectura moderna de componentes stand-alone, con un fuerte enfoque en seguridad, cifrado de datos local/remoto y persistencia de sesión segura en el navegador.

## 🛠️ Stack Tecnológico

El frontend ha sido desarrollado utilizando las siguientes tecnologías y librerías principales:

- **Framework:** [Angular v21.2.10](https://angular.dev/) (Standalone Components, Signals, Router, Reactive Forms)
- **Biblioteca de UI:** [PrimeNG v21.1.1](https://primeng.org/) & [PrimeIcons](https://github.com/primefaces/primeicons) (Componentes de interfaz listos para producción)
- **Estilos y Maquetación:** [TailwindCSS v3.4.19](https://tailwindcss.com/) & [Bootstrap v5.3.8](https://getbootstrap.com/)
- **Base de Datos del Navegador:** [Dexie.js v4.3.0](https://dexie.org/) (Wrapper de IndexedDB para manejo de datos persistentes localmente)
- **Criptografía:** [Crypto-JS v4.2.0](https://cryptojs.gitbook.io/docs/) (Implementación de AES para cifrado simétrico)
- **Manejo de JWT:** [@auth0/angular-jwt v5.2.0](https://github.com/auth0/angular-jwt) (Decodificación y verificación de tokens de sesión)
- **Alertas:** [SweetAlert2](https://sweetalert2.github.io/) (`@sweetalert2/ngx-sweetalert2`) para cuadros de diálogo interactivos

---

## 🔒 Arquitectura de Seguridad y Criptografía

El proyecto implementa un flujo de seguridad avanzado para proteger los datos en tránsito y en reposo:

### 1. Cifrado Local en IndexedDB

- La aplicación inicializa una base de datos local llamada `pruebatecnica` mediante **Dexie.js**.
- Los datos del usuario, el token JWT y los permisos se almacenan de manera cifrada en la tabla `sessions`.
- Para encriptar esta información, se utiliza un servicio de cifrado simétrico (`EncryptService`) implementado con **AES-CBC** y padding **PKCS7**.
- Las llaves criptográficas se cargan dinámicamente y se resguardan en memoria mediante **Angular Signals**.

### 2. Interceptores HTTP Criptográficos

- **`RequestInterceptor`**:
  - Intercepta cada petición HTTP saliente.
  - Si se encuentra en ambiente de producción (`environment.production: true`), cifra de forma automática el payload del cuerpo del mensaje.
  - Genera firmas dinámicas por tiempo (`generateTimeBasedKey`) que rotan cada minuto, y firmas determinísticas basadas en endpoint (`generarKeyIVEndpoint`), agregando seguridad adicional en las cabeceras `Authorization` (Bearer con token cifrado) y cabeceras personalizadas (`X-Api-Key`, `X-Chanel`, `X-Vector-Key`, `X-Code-Boarding`).
- **`ResponseInterceptor`**:
  - Intercepta las respuestas entrantes del servidor.
  - Desenvuelve el contenedor seguro `pt` enviado por la API y, en producción, descifra el payload para entregar un JSON limpio a los servicios de la aplicación.
  - Maneja de manera centralizada la desencriptación de errores HTTP.

### 3. Silent Login (Reactivación de Sesión)

- Al recargar la página (F5), la aplicación no pierde la sesión ni solicita credenciales al usuario.
- El servicio `AuthService` ejecuta una reactivación silenciosa (`reactiveteSession`) recuperando las llaves y credenciales cifradas desde IndexedDB, re-autenticándose con el servidor de fondo de manera transparente.

---

## 📂 Estructura del Proyecto

A continuación se detalla la organización de los directorios clave del proyecto:

```text
src/
├── app/
│   ├── components/                 # Componentes genéricos de UI (Ej. CustomPassword, Login)
│   ├── core/                       # Núcleo de la aplicación (Directivas, Guards, Interceptors, etc.)
│   │   ├── guards/                 # Guardianes de rutas (authenticationGuard)
│   │   ├── interceptors/           # Interceptores de petición/respuesta HTTP
│   │   ├── interfaces/             # Definiciones de contratos e interfaces TypeScript comunes
│   │   ├── modules/                # Módulos de librerías externas integradas (Ej. PrimeNG)
│   │   └── services/               # Servicios de lógica compartida
│   │       ├── auth/               # Gestión de login, logout y validación de tokens
│   │       ├── encrypt/            # Cifrado/descifrado AES-CBC y generación de claves dinámicas
│   │       └── indexed-db/         # Gestión de Base de Datos local (Dexie.js)
│   ├── pages/                      # Vistas y páginas principales del flujo de negocio
│   │   ├── bienvenida/             # Pantalla de bienvenida post-login
│   │   ├── ecommerce/              # Módulo de administración de productos
│   │   │   ├── lista-productos/    # Visualización y eliminación de catálogo de productos
│   │   │   └── nuevo-producto/     # Formulario de alta y edición de productos (con validación de formulario y carga de base64)
│   │   └── main/                   # Layout base de la aplicación (Sidebar/Header y Navbar)
│   ├── app.config.ts               # Configuración global del bootstrap de Angular (Providers)
│   ├── app.routes.ts               # Enrutamiento general de la aplicación
│   └── app.ts                      # Componente raíz de la aplicación
├── environment/                    # Configuraciones por ambiente (Desarrollo, Producción, Test)
└── styles.scss                     # Estilos globales y configuraciones de TailwindCSS/PrimeNG
```

---

## 🚀 Instalación y Despliegue

Sigue estos pasos para poner en marcha el proyecto localmente:

### Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- [Angular CLI](https://angular.dev/tools/cli) (opcional, instalado globalmente `npm install -g @angular/cli`)

### 1. Clonar el repositorio e instalar dependencias

```bash
# Navegar a la carpeta del proyecto
cd pruebatecnica-frontend

# Instalar dependencias
npm install
```

### 2. Levantar el servidor de desarrollo

Para iniciar el proyecto en un servidor local ejecute:

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200/`. El backend local por defecto apunta a `http://localhost:3000/apis-services` (configurable en `src/environment/environment.ts`).

### 3. Compilación para Producción

Para generar un build optimizado para producción ejecute:

```bash
npm run build
```

Los archivos compilados listos para desplegar se ubicarán en el directorio `dist/pruebatecnica-frontend`.

### 4. Pruebas Unitarias

Para ejecutar las pruebas automatizadas con Karma y Jasmine ejecute:

```bash
npm run test
```

---

## 📝 Características de Negocio (E-Commerce)

El módulo de e-commerce implementa un flujo completo de catálogo y gestión de inventario:

- **Listado de Productos (`lista-productos`)**:
  - Carga del catálogo completo mediante petición HTTP con paginación/carga diferida.
  - Componente reutilizable de renderizado individual de productos.
  - Funcionalidad para eliminar productos con confirmaciones dinámicas.
- **Alta y Edición de Productos (`nuevo-producto`)**:
  - Formularios Reactivos (`FormGroup`) con validaciones de campos obligatorios, rangos de precio mínimos, stock y tallas seleccionadas.
  - Subida de imágenes de producto, lectura local mediante `FileReader` y codificación a **Base64** con previsualización inmediata.
  - Formulario reutilizado de forma dinámica: si la ruta recibe un parámetro `:code`, cambia a modo edición, pre-cargando los datos del producto para su actualización.
  - Catálogos precargados de manera asíncrona desde la API (categorías, marcas, tallas y estados).

---

## 🔄 Integración Continua (CI)

El proyecto cuenta con un flujo de integración continua preconfigurado para **GitHub Actions** en el archivo `.github/workflows/ci.yml`.

Cada vez que se realiza un `push` o un `pull request` en las ramas `main`, `master` o `develop`, se ejecutan automáticamente los siguientes pasos:
1. **Checkout del Código:** Descarga del código fuente en el contenedor de CI/CD.
2. **Setup de Node.js:** Instalación del entorno Node.js v20 utilizando la caché de `npm` para acelerar subsecuentes ejecuciones.
3. **Instalación de Dependencias:** Ejecución de `npm ci` para una instalación limpia y determinista basada en el `package-lock.json`.
4. **Verificación de Estilo:** Ejecución de `npx prettier --check` para verificar que el código cumple con las guías de estilo.
5. **Ejecución de Pruebas Unitarias:** Ejecución de las pruebas unitarias mediante `npm run test` usando Chrome en modo Headless (`ChromeHeadless`).
6. **Compilación de Producción:** Ejecución del comando de construcción `npm run build` para asegurar la compilación del proyecto sin errores.

