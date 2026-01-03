# EcoBazaar
AI assisted carbon footprint tracking shopping assistant which analyses shopping your trends and suggests more efficent carbon footprint shopping activities 

## Backend Authentication System

This project includes a complete authentication system built with Spring Boot, Maven, Hibernate, PostgreSQL, and JWT tokens.

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+

### Setup Instructions

1. **Create PostgreSQL Database**
   ```sql
   CREATE DATABASE ecobazaar;
   ```

2. **Configure Database Connection**
   Update `backend/src/main/resources/application.properties` with your PostgreSQL credentials:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/ecobazaar
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. **Build and Run**
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

   The application will start on `http://localhost:8080`

### API Endpoints

#### Public Endpoints (No Authentication Required)

1. **User Signup**
   - **POST** `/api/auth/signup`
   - **Request Body:**
     ```json
     {
       "username": "john_doe",
       "email": "john@example.com",
       "password": "password123"
     }
     ```
   - **Response:**
     ```json
     {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "type": "Bearer",
       "username": "john_doe",
       "message": "User registered successfully"
     }
     ```

2. **User Login**
   - **POST** `/api/auth/login`
   - **Request Body:**
     ```json
     {
       "username": "john_doe",
       "password": "password123"
     }
     ```
   - **Response:**
     ```json
     {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "type": "Bearer",
       "username": "john_doe",
       "message": "Login successful"
     }
     ```

#### Protected Endpoints (JWT Token Required)

All other endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

3. **Test Protected Endpoint**
   - **GET** `/api/test`
   - **Headers:**
     ```
     Authorization: Bearer <your_jwt_token>
     ```
   - **Response:**
     ```json
     {
       "message": "This is a protected endpoint",
       "username": "john_doe",
       "status": "JWT token is valid"
     }
     ```

4. **Get User Profile**
   - **GET** `/api/user/profile`
   - **Headers:**
     ```
     Authorization: Bearer <your_jwt_token>
     ```
   - **Response:**
     ```json
     {
       "message": "User profile endpoint",
       "username": "john_doe",
       "status": "authenticated"
     }
     ```

### JWT Token Configuration

- **Token Expiration:** 24 hours (86400000 milliseconds)
- **Secret Key:** Configured in `backend/src/main/resources/application.properties` (change in production!)
- **Token Format:** Bearer token in Authorization header

### Security Features

- ✅ Password encryption using BCrypt
- ✅ JWT token-based authentication
- ✅ All endpoints (except signup/login) require JWT token
- ✅ Token validation on every request
- ✅ Username and email uniqueness validation
- ✅ Input validation using Jakarta Validation

### Project Structure

```
EcoBazaar/
├── backend/
│   ├── pom.xml                               # Maven configuration
│   └── src/
│       └── main/
│           ├── java/com/ecobazaar/
│           │   ├── config/
│           │   │   └── SecurityConfig.java          # Spring Security configuration
│           │   ├── controller/
│           │   │   ├── AuthController.java          # Signup/Login endpoints
│           │   │   └── ProtectedController.java     # Protected endpoints example
│           │   ├── dto/
│           │   │   ├── AuthResponse.java            # Authentication response DTO
│           │   │   ├── LoginRequest.java            # Login request DTO
│           │   │   └── SignupRequest.java           # Signup request DTO
│           │   ├── entity/
│           │   │   └── User.java                    # User entity with Hibernate
│           │   ├── filter/
│           │   │   └── JwtAuthenticationFilter.java # JWT authentication filter
│           │   ├── repository/
│           │   │   └── UserRepository.java          # User repository interface
│           │   ├── service/
│           │   │   └── UserService.java             # Business logic for auth
│           │   ├── util/
│           │   │   └── JwtUtil.java                 # JWT token utilities
│           │   └── EcoBazaarApplication.java        # Main application class
│           └── resources/
│               └── application.properties            # Application configuration
└── README.md
```

### Testing with cURL

**Signup:**
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

**Access Protected Endpoint:**
```bash
curl -X GET http://localhost:8080/api/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Notes

- The database schema will be automatically created/updated by Hibernate on startup
- JWT tokens expire after 24 hours
- All passwords are hashed using BCrypt before storage
- Change the JWT secret key in production for security