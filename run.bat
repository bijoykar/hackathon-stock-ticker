@echo off
echo Starting Stock Ticker API...
echo.
echo Default Users:
echo - Admin: username=admin, password=admin123
echo - User: username=user, password=user123
echo.
echo API Documentation: http://localhost:8080/swagger-ui.html
echo H2 Database Console: http://localhost:8080/h2-console
echo.
mvn spring-boot:run
