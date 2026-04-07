@REM Maven Wrapper script for Windows
@REM Downloads Maven Wrapper JAR and Maven automatically
@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "WRAPPER_JAR=%~dp0.mvn\wrapper\maven-wrapper.jar"
set "WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"

@REM Check Java
java -version >NUL 2>&1
if ERRORLEVEL 1 (
    echo Error: Java is not installed or not in PATH.
    exit /B 1
)

@REM Download Maven Wrapper JAR if not present
if not exist "%WRAPPER_JAR%" (
    echo Downloading Maven Wrapper JAR...
    if not exist "%~dp0.mvn\wrapper" mkdir "%~dp0.mvn\wrapper"
    powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%WRAPPER_URL%' -OutFile '%WRAPPER_JAR%' }"
    if not exist "%WRAPPER_JAR%" (
        echo Failed to download Maven Wrapper JAR.
        exit /B 1
    )
    echo Maven Wrapper JAR downloaded successfully.
)

@REM Run Maven Wrapper
java %MAVEN_OPTS% -jar "%WRAPPER_JAR%" %*

endlocal
