# Estructura del Código de KeyBastion

Este documento explica la estructura y organización del código de la aplicación KeyBastion, tanto del backend como del frontend.

## Estructura del Backend (Spring Boot)

El backend de KeyBastion está desarrollado con Spring Boot y sigue una arquitectura MVC (Modelo-Vista-Controlador) con las siguientes capas:

### 1. Controladores (`controllers`)

Los controladores manejan las peticiones HTTP y definen los endpoints REST de la API:

- **AuthController**: Gestiona la autenticación de usuarios (login/registro)
- **UserController**: Operaciones relacionadas con usuarios
- **PasswordController**: Generación y evaluación de contraseñas

Ejemplo de endpoint en `AuthController`:
```java
@PostMapping("/login")
public ResponseEntity<AuthDTO.JwtResponse> login(@Valid @RequestBody AuthDTO.LoginRequest loginRequest) {
    // Lógica de autenticación
    // ...
    return ResponseEntity.ok(new AuthDTO.JwtResponse(token, username, roles));
}
```

### 2. Servicios (`services`)

Contienen la lógica de negocio de la aplicación:

- **AuthService**: Lógica de autenticación y generación de tokens JWT
- **UserService**: Gestión de usuarios
- **PasswordService**: Generación y evaluación de contraseñas
- **ActivityLogService**: Registro de actividades

### 3. Repositorios (`repositories`)

Interfaces que extienden de JpaRepository para interactuar con la base de datos:

- **UserRepository**: Operaciones CRUD para usuarios
- **CredentialRepository**: Operaciones CRUD para credenciales
- **CategoryRepository**: Operaciones CRUD para categorías
- **ActivityLogRepository**: Operaciones CRUD para registros de actividad
- **SharingRepository**: Operaciones CRUD para comparticiones

### 4. Modelos (`model`)

Clases que representan las entidades de la base de datos:

- **User**: Usuario del sistema
- **Credential**: Credenciales almacenadas
- **Category**: Categorías para organizar credenciales
- **ActivityLog**: Registro de actividades
- **Sharing**: Compartición de credenciales
- **UserSettings**: Configuración del usuario
- **Role**: Roles de usuario (enumeración)

### 5. DTOs (`dto`)

Objetos de transferencia de datos para la comunicación entre cliente y servidor:

- **AuthDTO**: DTOs para autenticación (login, registro, respuesta JWT)
- **PasswordGenerationRequest**: Solicitud de generación de contraseña
- **PasswordGenerationResponse**: Respuesta con la contraseña generada

### 6. Configuración de Seguridad (`security`)

Clases para la configuración de seguridad y autenticación:

- **RsaKeyConfig**: Configuración de claves RSA para JWT
- **SecurityConfig**: Configuración de Spring Security
- **JwtTokenProvider**: Generación y validación de tokens JWT

### 7. Excepciones (`exceptions`)

Clases para el manejo de excepciones personalizadas:

- **ResourceNotFoundException**: Excepción para recursos no encontrados
- **BadRequestException**: Excepción para solicitudes incorrectas
- **AuthenticationException**: Excepción para errores de autenticación

## Estructura del Frontend (React)

El frontend de KeyBastion está desarrollado con React, TypeScript y Tailwind CSS, siguiendo una arquitectura basada en componentes:

### 1. Componentes (`components`)

Elementos reutilizables de la interfaz de usuario:

- **Layout.tsx**: Estructura principal de la aplicación (sidebar, header)
- **ProtectedRoute.tsx**: Componente para proteger rutas que requieren autenticación

### 2. Páginas (`pages`)

Vistas completas de la aplicación:

- **Login.tsx**: Página de inicio de sesión
- **Register.tsx**: Página de registro
- **Dashboard.tsx**: Panel principal con estadísticas
- **PasswordGenerator.tsx**: Generador de contraseñas
- **NotFound.tsx**: Página 404 para rutas no encontradas

### 3. Contexto (`context`)

Gestión del estado global de la aplicación:

- **AuthContext.tsx**: Contexto para la autenticación de usuarios (login, registro, logout)

### 4. Servicios (`services`)

Comunicación con la API del backend:

- **api.ts**: Configuración de Axios para las peticiones HTTP

### 5. Utilidades (`utils`)

Funciones auxiliares y utilidades:

- Funciones para validación de datos
- Funciones para formateo de fechas
- Funciones para cifrado/descifrado

### 6. Estilos (`index.css`)

Estilos globales y configuración de Tailwind CSS:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply px-4 py-2 font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700;
  }
  // Otros estilos personalizados
}
```

## Flujo de Datos

### Autenticación

1. El usuario introduce sus credenciales en el frontend (Login.tsx)
2. El frontend envía una petición POST a `/api/auth/login` (AuthContext.tsx)
3. El backend valida las credenciales (AuthController.java)
4. Si son válidas, genera un token JWT (AuthService.java)
5. El token se devuelve al frontend y se almacena en localStorage
6. El frontend incluye el token en las cabeceras de las peticiones posteriores

### Generación de Contraseñas

1. El usuario configura los parámetros en el frontend (PasswordGenerator.tsx)
2. El frontend envía una petición POST a `/api/passwords/generate`
3. El backend genera la contraseña según los parámetros (PasswordController.java)
4. La contraseña generada y su evaluación de fortaleza se devuelven al frontend
5. El frontend muestra la contraseña y su evaluación al usuario

## Seguridad Implementada

### Backend

- **Autenticación JWT Avanzada**:
  - Tokens firmados con claves RSA (asimétricas)
  - **Token Blacklisting**: Revocación inmediata de tokens durante el cierre de sesión
  - **Refresh Token Rotation**: Tokens de actualización de un solo uso
  - Validación completa de tokens contra lista negra
- **Cabeceras de Seguridad HTTP**:
  - Content Security Policy (CSP) para prevenir XSS
  - X-Content-Type-Options contra MIME sniffing
  - X-XSS-Protection para capa adicional contra XSS
  - Frame Options para prevenir clickjacking
  - HSTS para forzar conexiones HTTPS
  - Referrer Policy para control de fuga de información
  - Permissions Policy para restringir funcionalidades del navegador
- **Contraseñas con BCrypt**: Almacenamiento seguro de contraseñas
- **Validación de Entradas**: Con anotaciones de validación de Jakarta
- **Control de Acceso**: Basado en roles y permisos
- **Registro de Actividades**: Auditoría detallada de eventos de seguridad

### Frontend

- **Gestión de Tokens**:
  - Almacenamiento seguro de tokens de acceso
  - Manejo de revocación y rotación de tokens
  - Renovación automática de tokens expirados
- **Rutas Protegidas**: Componente ProtectedRoute
- **Interceptores Axios**: Para incluir tokens en las peticiones
- **Manejo de Errores**: Captura y gestión de errores de autenticación
- **Protección XSS**: Sanitización de entradas y renderizado seguro

## Buenas Prácticas Implementadas

1. **Separación de Responsabilidades**: Cada componente tiene una única responsabilidad
2. **Código Limpio**: Nombres descriptivos, comentarios útiles
3. **Manejo de Errores**: Gestión centralizada de excepciones
4. **Seguridad**: Implementación de múltiples capas de seguridad
5. **Responsive Design**: Interfaz adaptable a diferentes dispositivos
6. **Accesibilidad**: Componentes accesibles con Headless UI
7. **Rendimiento**: Optimización de componentes React

## Diagrama de Arquitectura

```
+------------------+       +-------------------+
|                  |       |                   |
|  React Frontend  |<----->|  Spring Backend   |
|                  |  API  |                   |
+------------------+       +-------------------+
        |                           |
        v                           v
+------------------+       +-------------------+
|                  |       |                   |
|  Local Storage   |       |  MySQL Database   |
|                  |       |                   |
+------------------+       +-------------------+
```

## Conclusión

La arquitectura de KeyBastion sigue patrones de diseño modernos y buenas prácticas tanto en el backend como en el frontend. La separación clara de responsabilidades y la implementación de múltiples capas de seguridad hacen que la aplicación sea robusta, mantenible y segura.
