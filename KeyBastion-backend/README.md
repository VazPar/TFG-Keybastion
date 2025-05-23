# 🔒 KeyBastion Backend

> API RESTful segura y escalable para la gestión de contraseñas

El backend de KeyBastion proporciona la columna vertebral de seguridad y funcionalidad para todo el sistema de gestión de contraseñas. Implementado con Spring Boot y Java 21, ofrece una arquitectura robusta y moderna.

## ✨ Tecnologías Principales

| Tecnología | Versión | Propósito |
|------------|---------|----------|
| **Java** | 21 | Lenguaje de programación base |
| **Spring Boot** | 3.4.3 | Framework de aplicación |
| **Spring Security** | 6.x | Autenticación y autorización |
| **Spring Data JPA** | 3.x | Capa de persistencia |
| **JWT** | - | Autenticación basada en tokens |
| **BCrypt** | - | Hash seguro de contraseñas |
| **H2/MySQL** | 8.0+ | Bases de datos |
| **Maven** | 3.8+ | Gestión de dependencias |

## 📒 Arquitectura del Proyecto

```
+------------------+             +----------------+
| Controladores    |------------>| Servicios      |
| (API endpoints)  |             | (Lógica negocio) |
+------------------+             +----------------+
         |                              |
         v                              v
+------------------+             +----------------+
| DTOs             |             | Repositorios   |
| (Transferencia)  |             | (Persistencia) |
+------------------+             +----------------+
                                        |
                                        v
                                 +----------------+
                                 | Entidades      |
                                 | (Modelo datos) |
                                 +----------------+
```

### 💾 Estructura de Paquetes

| Paquete | Responsabilidad |
|---------|------------------|
| 📝 `controllers` | Endpoints REST y manejo de peticiones HTTP |
| ⚙️ `services` | Lógica de negocio y operaciones principales |
| 💾 `repositories` | Interacción con base de datos vía JPA |
| 📄 `model` | Entidades JPA y objetos de dominio |
| 🔧 `config` | Configuraciones de la aplicación |
| 🔐 `security` | Seguridad, JWT y autorización |
| 📝 `dto` | Objetos para transferencia de datos |

## 🌐 API Endpoints

### 🔑 Autenticación

| Método | Endpoint | Descripción |
|---------|----------|-------------|
| `POST` | `/api/auth/login` | Iniciar sesión y obtener tokens JWT |
| `POST` | `/api/auth/register` | Registrar nuevo usuario |
| `POST` | `/api/auth/refresh` | Renovar token con refresh token |
| `POST` | `/api/auth/logout` | Cerrar sesión y revocar tokens |

### 👤 Usuarios

| Método | Endpoint | Descripción |
|---------|----------|-------------|
| `GET` | `/api/users/{id}` | Usuario por ID |
| `GET` | `/api/users/email/{email}` | Usuario por email |
| `GET` | `/api/users/username/{username}` | Usuario por nombre |
| `PUT` | `/api/users/update` | Actualizar información |
| `DELETE` | `/api/users/{id}` | Eliminar usuario |
| `GET` | `/api/users/all` | Listar todos los usuarios |
| `GET` | `/api/users/role/{role}` | Filtrar por rol |

### 🔑 Contraseñas

| Método | Endpoint | Descripción |
|---------|----------|-------------|
| `POST` | `/api/passwords/generate` | Generar contraseña segura |
| `POST` | `/api/passwords/evaluate` | Evaluar fortaleza |

## Requisitos del Sistema

- Java 21 o superior
- Maven 3.8 o superior
- MySQL 8.0 o superior (o H2 para desarrollo)

## Instalación y Configuración

### Inicio Rápido

Para iniciar rápidamente la aplicación completa (backend y frontend), utiliza los scripts proporcionados en el directorio raíz del proyecto:

#### Windows
```bash
start-keybastion.bat
```

#### Linux
```bash
chmod +x start-keybastion.sh
./start-keybastion.sh
```

Estos scripts iniciarán automáticamente tanto el backend como el frontend, y abrirán la aplicación en tu navegador predeterminado.

1. Clonar el repositorio:
   ```
   git clone https://github.com/yourusername/KeyBastion.git
   cd KeyBastion/KeyBastion-backend
   ```

2. Configurar la base de datos:
   - Editar el archivo `src/main/resources/application.properties` con los datos de conexión a tu base de datos

3. Compilar y ejecutar el proyecto:
   ```
   mvn clean install
   mvn spring-boot:run
   ```

4. El servidor estará disponible en `http://localhost:9000`

## Ejecución con Contenedores

### Docker

El backend puede ejecutarse fácilmente en un contenedor Docker:

1. Construir la imagen:
   ```bash
   docker build -t keybastion-backend .
   ```

2. Ejecutar el contenedor:
   ```bash
   docker run -p 9000:9000 \
     -e SPRING_PROFILES_ACTIVE=prod \
     -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/keybastion \
     -e SPRING_DATASOURCE_USERNAME=keybastion \
     -e SPRING_DATASOURCE_PASSWORD=keybastion_password \
     keybastion-backend
   ```

3. Acceder a la API en `http://localhost:9000`

### Podman (Alternativa sin daemon)

También puedes utilizar Podman como alternativa a Docker:

1. Construir la imagen:
   ```bash
   podman build -t keybastion-backend .
   ```

2. Ejecutar el contenedor:
   ```bash
   podman run -p 9000:9000 \
     -e SPRING_PROFILES_ACTIVE=prod \
     -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/keybastion \
     -e SPRING_DATASOURCE_USERNAME=keybastion \
     -e SPRING_DATASOURCE_PASSWORD=keybastion_password \
     keybastion-backend
   ```

3. Acceder a la API en `http://localhost:9000`

### Ejecución Completa con Compose

Para ejecutar el backend junto con el frontend y la base de datos, consulta las instrucciones en el README principal del proyecto para usar docker-compose o los scripts de Podman.

## 🔐 Seguridad Multicapa

### 🔒 Autenticación y Tokens

```java
// Ejemplo simplificado de generación de token JWT
public String generateToken(Authentication authentication) {
    return jwtEncoder.encode(JwtEncoderParameters.from(JwtClaimsSet.builder()
        .issuer("keybastion")
        .issuedAt(Instant.now())
        .expiresAt(Instant.now().plus(30, ChronoUnit.MINUTES))
        .subject(authentication.getName())
        .claim("roles", extractRoles(authentication))
        .build())).getTokenValue();
}
```

### 🛡️ Características de Seguridad

| Capa | Implementación | Beneficio |
|------|----------------|----------|
| **Autenticación** | JWT con firma RSA | Verificación criptográfica de identidad |
| | Token Blacklisting | Revocación inmediata de acceso |
| | Refresh Token Rotation | Tokens de un solo uso |
| **Almacenamiento** | BCrypt (10+ rounds) | Protección contra ataques de fuerza bruta |
| | Cifrado AES | Protección de datos sensibles |
| **HTTP** | Content Security Policy | Mitigación de XSS |
| | X-Frame-Options: DENY | Prevención de clickjacking |
| | HSTS | Forzado de HTTPS |
| **Control** | RBAC (Role-Based Access) | Separación de responsabilidades |
| | Auditoría completa | Trazabilidad de acciones |

## Desarrollo

### Configuración del Entorno de Desarrollo

1. Instalar las herramientas necesarias:
   - JDK 21
   - Maven
   - IDE (recomendado: IntelliJ IDEA, Eclipse)

2. Configurar la base de datos:
   - Para desarrollo, se puede usar H2 (en memoria)
   - Para producción, configurar MySQL

### Pruebas

Para ejecutar las pruebas:

```
mvn test
```

## Despliegue

Para construir el proyecto para producción:

```
mvn clean package
```

Para ejecutar el JAR generado:

```
java -jar target/KeyBastion-backend-1.0.0.jar
```

### Variables de Entorno

El backend puede configurarse mediante variables de entorno:

- `SPRING_PROFILES_ACTIVE`: Perfil activo (dev, prod)
- `SPRING_DATASOURCE_URL`: URL de conexión a la base de datos
- `SPRING_DATASOURCE_USERNAME`: Usuario de la base de datos
- `SPRING_DATASOURCE_PASSWORD`: Contraseña de la base de datos
- `JWT_SECRET`: Clave secreta para firmar tokens JWT
- `JWT_EXPIRATION`: Tiempo de expiración de tokens en milisegundos

## Compatibilidad entre Plataformas

El backend de KeyBastion está diseñado para funcionar de manera consistente en diferentes sistemas operativos:

- **Windows**: Desarrollo y ejecución nativa con Maven, o en contenedores con Docker Desktop
- **Linux**: Desarrollo y ejecución nativa con Maven, o en contenedores con Docker o Podman
- **macOS**: Desarrollo y ejecución nativa con Maven, o en contenedores con Docker Desktop

## Solución de Problemas Comunes

1. **Error de conexión a la base de datos**:
   - Verifica que la base de datos esté en ejecución y sea accesible
   - Comprueba las credenciales en `application.properties` o en las variables de entorno
   - Si usas contenedores, asegúrate de que la URL de la base de datos sea correcta para el entorno de contenedores

2. **Errores de compilación**:
   - Asegúrate de usar Java 21 o superior: `java -version`
   - Verifica que Maven esté correctamente instalado: `mvn -version`
   - Ejecuta `mvn clean` antes de compilar nuevamente

3. **Problemas con contenedores**:
   - Si usas Docker/Podman, verifica que el puerto 9000 no esté en uso
   - En Linux con Podman, puede ser necesario configurar correctamente el modo rootless
   - Para problemas de red entre contenedores, verifica la configuración de red del contenedor

## Licencia

[Licencia MIT](LICENSE)
