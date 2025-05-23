# KeyBastion | Gestor de Contraseñas Seguro

![KeyBastion Logo](https://via.placeholder.com/150x150.png?text=KeyBastion)

KeyBastion es una aplicación completa de gestión de contraseñas que permite a los usuarios:

- ✨ **Almacenar** credenciales de forma segura y cifrada
- 🔑 **Generar** contraseñas fuertes con evaluación de seguridad 
- 👥 **Compartir** contraseñas con otros usuarios de forma controlada

El proyecto combina un potente backend en Spring Boot con un frontend moderno y accesible en React.

## 💻 Estructura del Proyecto

El sistema está dividido en dos componentes independientes pero integrados:

| Componente | Tecnologías | Descripción |
|------------|--------------|-------------|
| **KeyBastion-backend** | Spring Boot, Java 21 | API RESTful segura con autenticación JWT |
| **KeyBastion-frontend** | React, TypeScript, Tailwind CSS | Interfaz moderna, responsive y accesible |

## ✨ Características Principales

### Seguridad y Autenticación
- 🔒 **Autenticación JWT avanzada** con token blacklisting y rotación
- 💾 **Almacenamiento cifrado** de todas las credenciales
- 🛡️ **Cabeceras de seguridad** completas (CSP, HSTS, XSS Protection)

### Funcionalidades Clave
- 🌟 **Generador inteligente** de contraseñas con evaluación de fortaleza
- 📂 **Categorización flexible** para organizar credenciales
- 👥 **Compartición controlada** con otros usuarios
- 📋 **Registro detallado** de todas las actividades

### Compatibilidad y Despliegue
- 💻 **Multiplataforma**: Windows, Linux y macOS
- 📦 **Despliegue flexible**: Nativo, Docker o Podman

## Requisitos del Sistema

### Backend
- Java 21 o superior
- Maven 3.8 o superior
- MySQL 8.0 o superior (o H2 para desarrollo)

### Frontend
- Node.js 16 o superior
- npm 8 o superior

### Contenedores (Opcional)
- Docker y Docker Compose, o
- Podman y Podman Compose

## Guía Completa de Instalación y Ejecución

### Inicio Rápido

Para iniciar rápidamente la aplicación completa (backend y frontend), utiliza los scripts proporcionados:

#### Windows
```
start-keybastion.bat
```

#### Linux
```
chmod +x start-keybastion.sh
./start-keybastion.sh
```

Estos scripts iniciarán automáticamente tanto el backend como el frontend, y abrirán la aplicación en tu navegador predeterminado.

### Pasos para Ejecutar el Backend (KeyBastion-backend)

#### Ejecución en Windows

1. Navegar al directorio del backend:
   ```
   cd KeyBastion-backend
   ```

2. Compilar el proyecto con Maven:
   ```
   mvn clean install
   ```

3. Ejecutar la aplicación Spring Boot:
   ```
   mvn spring-boot:run
   ```
   
   Alternativamente, puedes ejecutar el archivo JAR generado:
   ```
   java -jar target/KeyBastion-backend-0.0.1-SNAPSHOT.jar
   ```

4. El servidor backend estará disponible en `http://localhost:9000`

#### Ejecución en Linux

1. Navegar al directorio del backend:
   ```
   cd KeyBastion-backend
   ```

2. Asegurar que los scripts tienen permisos de ejecución:
   ```
   chmod +x mvnw
   ```

3. Compilar y ejecutar con el wrapper de Maven:
   ```
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

4. El servidor backend estará disponible en `http://localhost:9000`

### Pasos para Ejecutar el Frontend (KeyBastion-frontend)

#### Ejecución en Windows

1. Navegar al directorio del frontend:
   ```
   cd KeyBastion-frontend
   ```

2. Instalar todas las dependencias:
   ```
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```
   npm run dev
   ```

4. La aplicación frontend estará disponible en `http://localhost:3000`

5. Para construir la versión de producción:
   ```
   npm run build
   ```
   
   Los archivos compilados se generarán en el directorio `dist/`

#### Ejecución en Linux

1. Navegar al directorio del frontend:
   ```
   cd KeyBastion-frontend
   ```

2. Instalar todas las dependencias:
   ```
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```
   npm run dev
   ```

4. La aplicación frontend estará disponible en `http://localhost:3000`

5. Para construir la versión de producción:
   ```
   npm run build
   ```

### Ejecución Nativa (Sin Contenedores)

La forma más sencilla de ejecutar KeyBastion es directamente en tu sistema operativo sin necesidad de contenedores:

#### Windows

1. Asegúrate de tener instalados los requisitos:
   - Java 21 o superior
   - Maven 3.8 o superior
   - Node.js 16 o superior
   - MySQL 8.0 (opcional, puede estar en otro servidor)

2. Ejecuta el script de inicio:
   ```
   run-keybastion-native.bat
   ```

3. Para detener la aplicación:
   ```
   stop-keybastion-native.bat
   ```

#### Linux

1. Asegúrate de tener instalados los requisitos:
   - Java 21 o superior
   - Maven 3.8 o superior
   - Node.js 16 o superior
   - MySQL 8.0 (opcional, puede estar en otro servidor)

2. Haz ejecutable el script de inicio:
   ```
   chmod +x run-keybastion-native.sh
   ```

3. Ejecuta el script:
   ```
   ./run-keybastion-native.sh
   ```

4. Para detener la aplicación:
   ```
   chmod +x stop-keybastion-native.sh
   ./stop-keybastion-native.sh
   ```

5. La aplicación estará disponible en:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:9000`

### Ejecución con Docker (Recomendado para Entornos de Producción)

KeyBastion puede ejecutarse fácilmente en cualquier plataforma utilizando Docker:

1. Asegúrate de tener Docker y Docker Compose instalados en tu sistema.

2. Desde el directorio raíz del proyecto, ejecuta:
   ```
   docker-compose up -d
   ```

3. La aplicación estará disponible en:
   - Frontend: `http://localhost:80`
   - Backend API: `http://localhost:9000`

4. Para detener los contenedores:
   ```
   docker-compose down
   ```

5. Para reconstruir después de cambios:
   ```
   docker-compose up -d --build
   ```

### Ejecución con Podman (Alternativa sin daemon para Linux)

KeyBastion también puede ejecutarse utilizando Podman, una alternativa sin daemon a Docker:

1. Asegúrate de tener Podman instalado en tu sistema Linux:
   ```
   # En Fedora/RHEL/CentOS
   sudo dnf install podman podman-compose

   # En Ubuntu/Debian
   sudo apt install podman podman-compose
   ```

2. Utiliza los scripts proporcionados para gestionar la aplicación:
   ```
   # Dar permisos de ejecución a los scripts
   chmod +x run-podman.sh stop-podman.sh
   
   # Para iniciar la aplicación
   ./run-podman.sh

   # Para detener la aplicación
   ./stop-podman.sh
   ```

3. Alternativamente, si tienes podman-compose instalado, puedes usar:
   ```
   # Para iniciar
   podman-compose up -d

   # Para detener
   podman-compose down
   ```

4. La aplicación estará disponible en:
   - Frontend: `http://localhost:80`
   - Backend API: `http://localhost:9000`

5. Ventajas de Podman:
   - No requiere un daemon en ejecución
   - Puede ejecutarse sin privilegios de root
   - Compatible con los mismos Dockerfiles y docker-compose.yml
   - Mayor seguridad por su arquitectura sin daemon

### Ejecutando Ambos Componentes Juntos

Para una experiencia completa de la aplicación, es necesario ejecutar tanto el backend como el frontend:

1. Inicia primero el backend siguiendo los pasos anteriores
2. En otra terminal, inicia el frontend siguiendo sus respectivos pasos
3. Accede a `http://localhost:3000` para utilizar la aplicación completa

## Configuración de la Base de Datos

### Configuración para Desarrollo (H2)

El backend está configurado por defecto para usar H2 (base de datos en memoria) para desarrollo:

1. No se requiere configuración adicional para H2
2. La consola de H2 está disponible en `http://localhost:9000/h2-console`
3. Datos de conexión por defecto:
   - JDBC URL: `jdbc:h2:mem:keybastion`
   - Usuario: `sa`
   - Contraseña: (dejar en blanco)

### Configuración para Producción (MySQL)

Para usar MySQL en producción:

1. Crea una base de datos MySQL:
   ```sql
   CREATE DATABASE keybastion;
   ```

2. Edita el archivo `application.properties` en `KeyBastion-backend/src/main/resources/`:
   ```properties
   # Comentar o eliminar la configuración de H2
   # spring.datasource.url=jdbc:h2:mem:keybastion
   
   # Configuración de MySQL
   spring.datasource.url=jdbc:mysql://localhost:3306/keybastion
   spring.datasource.username=tu_usuario
   spring.datasource.password=tu_contraseña
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
   ```

3. Reinicia la aplicación backend para aplicar los cambios

## Compatibilidad entre Plataformas

KeyBastion está diseñado para funcionar de manera consistente en diferentes sistemas operativos:

### Windows
- Desarrollo y ejecución nativa con npm y Maven
- Ejecución en contenedores con Docker Desktop

### Linux
- Desarrollo y ejecución nativa con npm y Maven
- Múltiples opciones de contenedores:
  - Docker y Docker Compose
  - Podman y Podman Compose (sin necesidad de daemon)

### macOS
- Desarrollo y ejecución nativa con npm y Maven
- Ejecución en contenedores con Docker Desktop

## Solución de Problemas Comunes

### Backend

1. **Error de puerto ocupado**:
   ```
   Web server failed to start. Port 9000 was already in use.
   ```
   Solución: Termina el proceso que está usando el puerto 9000 o cambia el puerto en `application.properties`:
   ```properties
   server.port=9001
   ```

2. **Error de conexión a la base de datos**:
   Verifica los datos de conexión en `application.properties` y asegúrate de que el servidor de base de datos esté en ejecución.

### Frontend

1. **Error de conexión al backend**:
   Si ves errores de tipo "Network Error" o "Failed to fetch", verifica:
   - Que el backend esté en ejecución
   - Que la configuración del proxy en `vite.config.ts` sea correcta
   - Que no haya problemas de CORS

2. **Errores de dependencias**:
   Si hay errores al instalar dependencias, intenta:
   ```
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

### Contenedores

1. **Error al iniciar contenedores**:
   - Verifica que Docker/Podman esté instalado y en ejecución
   - Asegúrate de que los puertos 80, 9000 y 3306 estén disponibles
   - En Linux, asegúrate de tener permisos suficientes para ejecutar contenedores

2. **Problemas con Podman**:
   - Si encuentras problemas con podman-compose, utiliza el script `run-podman.sh` que ofrece una alternativa con comandos nativos de Podman
   - Verifica que estás usando una versión reciente de Podman (4.0+)

3. **Problemas de red entre contenedores**:
   - En Podman, puede ser necesario configurar el modo rootless correctamente
   - Verifica la configuración de red con `podman network inspect keybastion-network`

## Arquitectura del Sistema

### Backend

El backend sigue una arquitectura en capas:

- **Controladores**: Manejan las peticiones HTTP y definen los endpoints REST
- **Servicios**: Contienen la lógica de negocio
- **Repositorios**: Interactúan con la base de datos
- **Modelos**: Definen las entidades y DTOs
- **Seguridad**: Configuración de autenticación y autorización con JWT

### Frontend

El frontend sigue una arquitectura basada en componentes:

- **Componentes**: Elementos reutilizables de la interfaz de usuario
- **Páginas**: Vistas completas de la aplicación
- **Contextos**: Gestión del estado global (autenticación, etc.)
- **Servicios**: Comunicación con la API del backend
- **Utilidades**: Funciones auxiliares

## 🔐 Seguridad Multicapa

### Autenticación Avanzada

| Característica | Beneficio |
|------------------|------------|
| **Token JWT con firma RSA** | Autenticación robusta y verificable |
| **Token Blacklisting** | Revocación inmediata en cierre de sesión |
| **Refresh Token Rotation** | Prevención de ataques de reproducción |
| **Control de sesiones** | Gestión granular de acceso de usuarios |

### Protección de Datos

- 💻 **Cifrado BCrypt** para contraseñas de usuario
- 🔒 **Encriptación** de todas las credenciales almacenadas
- 🌐 **HTTPS forzado** para comunicaciones seguras
- 🛡️ **Validación estricta** contra inyecciones y ataques

### Cabeceras de Seguridad HTTP

```
Content-Security-Policy
X-Content-Type-Options
X-XSS-Protection
Strict-Transport-Security
Referrer-Policy
Permissions-Policy
```

### Auditoría y Monitoreo

- 📓 **Registro de actividad** detallado y persistente
- 🔍 **Trazabilidad** de todas las acciones de seguridad