# Stock Ticker REST API

A Spring Boot REST API that serves stock market data from a CSV file with JWT authentication and Swagger documentation.

## Features

- **JWT Authentication**: Secure API endpoints with JSON Web Tokens
- **Swagger Documentation**: Interactive API documentation at `/swagger-ui.html`
- **CSV Data Loading**: Automatically loads stock data from CSV file
- **Paginated Responses**: Support for pagination on large datasets
- **Time Range Filtering**: Query stock data by specific time ranges
- **H2 Database**: In-memory database for development
- **Exception Handling**: Comprehensive error handling with custom responses

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Stock Data
- `GET /api/stock-data/all` - Get all stock data
- `GET /api/stock-data/paginated` - Get paginated stock data
- `GET /api/stock-data/{id}` - Get stock data by ID
- `GET /api/stock-data/latest` - Get latest stock data
- `GET /api/stock-data/range` - Get stock data by time range
- `GET /api/stock-data/count` - Get total record count
- `POST /api/stock-data/load-csv` - Load CSV data manually

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6+

### Default Users
- **Admin**: username=`admin`, password=`admin123`
- **User**: username=`user`, password=`user123`

### Running the Application

1. Navigate to the project directory:
   ```
   cd hackathon-stock-ticker
   ```

2. Build and run the application:
   ```
   mvn spring-boot:run
   ```

3. The application will start on `http://localhost:8080`

### API Documentation
Visit `http://localhost:8080/swagger-ui.html` for interactive API documentation.

### H2 Database Console
Access the H2 database console at `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: `password`

## Authentication Flow

1. Register a new user or use default credentials
2. Login to get a JWT token
3. Include the token in the Authorization header: `Bearer <token>`
4. Access protected endpoints

## Example Usage

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get Stock Data
```bash
curl -X GET http://localhost:8080/api/stock-data/latest \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Configuration

Key configuration properties in `application.properties`:
- `jwt.secret`: JWT secret key
- `jwt.expiration`: Token expiration time (milliseconds)
- `csv.file.path`: Path to the CSV file
- Database configuration for H2

## Built With

- **Spring Boot 3.2.0** - Application framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Data persistence
- **JWT (jsonwebtoken)** - Token-based authentication
- **Swagger/OpenAPI 3** - API documentation
- **H2 Database** - In-memory database
- **OpenCSV** - CSV file processing
- **Maven** - Dependency management
