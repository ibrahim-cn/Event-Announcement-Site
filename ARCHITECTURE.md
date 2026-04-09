# Event-Advertisement-Site
## Change History

| Process | Date | Contributors | Description |
| :--- | :--- | :--- | :--- |
| **Creation** | February 2026 | İbrahim | Repository created.|
| **Initial Planning** | March 2026 | All Team | Defining the scope, purpose, and designing tools of the project. |
| **Researching** | March 2026 | All Team/Sude | Researching related informations and suitable architecture. |
| **Integrating** | March 2026 | All Team | Integrating tools and design process steps into our project architecture.  |
| **Developing Frontend** | April 2026 | Hatice | A frontend has been started to develop to meet user needs. |
| **Developing Backend** | April 2026 | Berivan | A backend has been started to develop to meet user needs. |
| **Improving Frontend** | April 2026 | Sude | Improvements and enhancements have been made to the frontend. |
| **Creating Database** | April 2026 | İbrahim | A database was created to run in parallel on the backend. |
| **Integrating Database into the Backend** | April 2026 | Berivan/İbrahim | The database was integrated into the backend, and the inconsistencies that occurred were eliminated. |
| **Finalizing Architectural Documentation** | April 2026 | Sude/Hatice | Our work has been documented in detail |

## Table of Contents
1- Scope
2- References
3- Software Architecture
4- Architectural Goals & Constraints
5- Logical Architecture
6- Process Architecture
7- Development Architecture 
8- Physical Architecture
9- Scenarios
10- Size and Performance
11- Quality
## Appendices: 
- Acronyms & Abbreviations
- Definitions
- Design Principles

## List of Figures
## 1. SCOPE
## 2. REFERENCES
## 3. SOFTWARE ARCHITECTURE
## 4. ARCHITECTURAL GOALS & CONSTRAINTS
## 5. ARCHITECTURAL DOCUMENTATION: LOGICAL VIEW
# 1. Domain Model and Data Structure
The core of the system is built on a robust entity-relationship model that manages the lifecycle of events and user interactions.
•	**Foundation (BaseEntity):** All domain objects inherit from this abstract superclass. It ensures that every record in the system possesses a unique identity (ID), a record of creation (createdDate), and an operational status flag.
• **User Management (AppUser):** Represents the primary actor. It manages personal credentials and acts as the "Organizer" for events through a One-to-Many relationship.
•	**Event Categorization (Category):** Provides a logical grouping for events (e.g., Seminar,football Match, Workshop), allowing for structured data retrieval and better user experience.
•	**Event Core (Event):** The central entity holding metadata such as title, description, location, and timing. It maintains Many-to-One relationships with both Category and AppUser.
•	**Participation Logic (EventRegistration):** A junction entity used to bridge users and events. It enforces a Unique Constraint to ensure a user cannot register for the same event more than once.
# 2. Service Layer & Business Intelligence
The Service layer serves as the "brain" of the application, encapsulating the rules that govern the system's behavior.
•	**Identity & Security (AuthService):**
o	Email Normalization: Systematically converts emails to lowercase and trims whitespace to prevent logical duplication.
o	Stateless Authentication: Integrates with JWT logic to provide secure, token-based access.
•	**Registration Integrity (EventRegistrationService):**
o	Self-Registration Guard: Logically prevents an organizer from registering for an event they created.
o	Validation: Ensures that both the event and the user exist and are active before confirming participation.
•	**Lifecycle Management (EventService):**
o	Cascade Cleanup: When an event is deleted, the service ensures all related registrations are purged first to maintain referential integrity.
# 3. API Design & Functional Exposure
The Controller layer exposes the internal logic through a RESTful API, organized by resource responsibility.
•	EventsController: Provides endpoints for creating, listing, and deleting events, specifically filtering actions based on the organizer's identity.
•	AppUsersController: Manages the CRUD lifecycle of users, ensuring that user data can be updated or retrieved securely.
•	AuthController: Handles the entry points for the application, specifically login and register scenarios.
•	CategoriesController: Exposes the taxonomy of the system, allowing for the management of event categories.
# 4. Automated Developer Tooling (SQL Export Logic)
A unique logical feature of this architecture is the State Persistence Mechanism found in DataSqlExportService.
•	Real-time Monitoring: Through the use of Hibernate event listeners (*DataSqlExportIntegrator*), the system tracks every logical change (*Insert/Update/Delete*).
•	Auto-Synchronization: Upon a successful transaction commit, the service automatically exports the current database state into a physical data.sql file. This ensures that the logical state of the development environment is always preserved and shareable via version control.

 <img width="606" height="795" alt="image" src="https://github.com/user-attachments/assets/19dc31f4-f0f1-4c4c-8096-d043ca2a179b" />


## 6. ARCHITECTURAL DOCUMENTATION: PROCESS VIEW
# 1. Request Processing Lifecycle
The system operates as a stateless web application where each HTTP request is handled in an independent execution thread.
•	Filter Chain Execution: Every incoming request first passes through the *SecurityConfig* filter chain.
•	Authentication Process: The *JwtAuthenticationFilter* intercepts requests to extract the "Bearer" token. It uses the *JwtService* to validate the token and extract the user's email. If valid, an Authentication object is injected into the SecurityContextHolder, allowing subsequent layers to identify the user.
•	Authorization: The *SecurityConfig* defines rules (e.g., *.authenticated()*) that processes must satisfy before reaching the Controller layer.
# 2. Transaction and State Synchronization
One of the most critical processes in this system is the automated state persistence mechanism that keeps the *data.sql* file in sync with the H2 database.
•	Hibernate Event Interception: When a user performs an action that modifies data (*INSERT, UPDATE, DELETE*), Hibernate's *DataSqlExportEventListener* captures the event.
•	Post-Commit Synchronization: To ensure data integrity, the system does not export the file during an active transaction. Instead, the *DataSqlExportService* uses *TransactionSynchronizationManager* to schedule the export process only after a successful database commit (*afterCommit*).
•	Atomic Export: The doExportNow method is wrapped in a synchronized(*exportLock*) block to prevent race conditions where multiple threads might attempt to write to the *data.sql file* at the same time.

<img width="605" height="318" alt="image" src="https://github.com/user-attachments/assets/d086778e-9486-4fe4-bd99-9bea99c76cc8" />

 
# 3. Concurrency and Resource Management
The system is designed to handle multiple concurrent users while maintaining strict logical boundaries.
•**Statelessness:** By utilizing SessionCreationPolicy.STATELESS, the system avoids server-side session overhead, allowing each process to be fully contained within the request thread.
•	**Thread Safety:**
o	Services: All services are managed as singleton beans by Spring, requiring thread-safe implementation.
o	Locking: The exportLock in the *DataSqlExportService* ensures that the "Export Process" is thread-safe, even when multiple administrative or user actions occur simultaneously.
•	**Database Isolation:** H2 database interactions are managed through *JdbcTemplate* and Spring Data JPA, ensuring that standard ACID properties are maintained during concurrent data access.
# 4. Key Runtime Sequences
The interactions between processes can be summarized in two main flows:
**A. Authentication Flow**
1.	Client sends credentials to /api/auth/login.
2.	*AuthService* validates the password.
3.	*JwtService* generates a signed token.
4.	Process returns a 200 OK with the token to the client.

**B. Event Creation & Export Flow**
1.	Authorized User sends an event object to /api/events.
2.	EventService begins a transaction and saves the entity via *EventRepository*.
3.	Post-Insert Event is triggered; *DataSqlExportService* binds an export task to the current transaction.
4.	Transaction Commits: The database is updated.
5.	Export Thread executes: The data.sql file is overwritten with the latest snapshot of all tables (*categories, app_users, events, event_registrations*).


## 7. ARCHITECTURAL DOCUMENTATION: DEVELOPMENT VIEW
# 1. Module Decomposition & Layering Strategy
The project is built using a Strict Layered Architecture to ensure a separation of concerns. This allows developers to modify business logic without impacting the database schema or the API endpoints.
•	Presentation Layer (*com.eventannouncement.controller*): Manages RESTful API endpoints. Controllers like *EventsController* and *AuthControlle*r handle HTTP request mapping and JSON serialization.
•	Business Logic Layer (*com.eventannouncement.service*): Encapsulates the core intelligence of the application. Services such as *EventService* and *EventRegistrationService* perform validation and coordinate data flow between layers.
•	Data Access Layer (*com.eventannouncement.repository*): Utilizes Spring Data JPA to abstract database operations. Interfaces like *AppUserRepository* and *EventRepository* provide standard CRUD and custom query capabilities.
•	Model Layer (*com.eventannouncement.model*): Contains the blueprint of the system. This includes the *BaseEntity* for auditability and domain-specific entities like *AppUser* and *Event*.
•	Infrastructure & Configuration (*com.eventannouncement.config & .security*): Houses cross-cutting concerns like JWT security filters and the specialized Hibernate event listeners for SQL exporting.
# 2. Technology Stack & Dependency Management
The system is developed using Java 21 and Spring Boot 3.4.4, managed primarily through Gradle (as seen in *build.gradle*), with legacy support for Maven (*pom.xml*).
•	Spring Boot Starters: Uses spring-boot-starter-web for REST APIs, spring-boot-starter-data-jpa for ORM, and spring-boot-starter-security for protection.
•	JSON Web Tokens (JWT): Implements io.jsonwebtoken (JJWT) for secure, stateless authentication.
•	Database: Employs an H2 In-Memory Database to facilitate rapid development and testing without requiring external database installation.
# 3. Specialized Developer Tooling
A distinctive feature of this project's development environment is the automated data synchronization mechanism.
•	*DataSqlExportService*: This internal utility monitors the database state. Whenever an *INSERT, UPDATE, or DELETE* occurs, it triggers a refresh of the *src/main/resources/data.sql* file.
•	Hibernate Integration: The development environment is configured via *DataSqlExportHibernateConfig* to inject custom Integrators and *EventListeners* into the Hibernate lifecycle. This ensures that the logical data state is always physically backed up for team collaboration.
# 4. Source Code Organization
The code is organized to follow industry-standard conventions, making it easily navigable for new developers:

| Package | Responsibility |
| :--- | :--- |
| **com.eventannouncement.dto** | Contains Data Transfer Objects (DTOs) for API requests and responses, such as *LoginRequest* and *AuthResponse*. |
| **com.eventannouncement.security** | Manages security filters, JWT extraction logic, and global authentication configurations. |
| **com.eventannouncement.config**| Configures system-wide Spring beans and Hibernate-level event listeners for the SQL export utility. |
| **resources/** | Holds the *application.properties* configuration file and the auto-generated *data.sql* database snapshot. |

# 5. Build and Deployment Artifacts
•	Version Control: The .gitignore is specifically configured to ignore build artifacts (like the build/ and out/ folders) while preserving essential project metadata.
•	Artifact Type: The project compiles into a single executable JAR file containing the embedded Tomcat server, making it ready for "Zero-Install" deployment.



## 8. PHYSICAL VIEW: DEPLOYMENT & INFRASTRUCTURE
# 1. Runtime Environment & Processing
The application is designed to be a lightweight, self-contained executable that minimizes external dependencies.
**•	Execution Unit:** The system is packaged as a single Executable JAR file, which includes all necessary libraries and an embedded web server.
**•	Java Runtime:** Requires Java Runtime Environment (JRE) 21 as the host environment.
**•	Web Server:** Uses an Embedded Tomcat 10 server, physically bound to Port 8081 (as configured in server.port=8081).
**•	Platform Independence:** Because it runs on the JVM, the application can be physically deployed on any OS (Windows, Linux, macOS) or within a Docker container.
# 2. Network Topology & Communication
The system follows a Client-Server model over a TCP/IP network.
**•	Client Access:** Users interact with the system via a web browser or API client over HTTP.
**•	Frontend-Backend Mapping:** While the API is hosted at the root, the application is physically configured to serve static frontend assets from a specific external directory (../frontend/) via the spring.web.resources.static-locations setting.
**•	CORS Policy:** The physical communication is governed by a flexible CORS policy that allows cross-origin requests from any source (*), facilitating integration with various frontend hosting scenarios.
# 3. Physical Storage & Persistence Strategy
The application employs a dual-layered persistence strategy to balance performance with data portability.
**•	Primary Database (H2):**
o	Storage Type: File-based persistence.
o	Physical Location: Data is saved to the host machine's disk at ./data/eventdb. This ensures that data survives application restarts, unlike purely in-memory configurations.
**•	State Snapshot (*data.sql*):**
o	Automated Export: Every data modification triggers a physical write to src/main/resources/data.sql.
o	Utility: This file acts as a version-controlled physical backup that allows developers to synchronize database states across different physical machines using Git.
# 4. Security Configuration
The physical security of the system's communication is managed through JWT (JSON Web Tokens).
**•	Token Storage:** Tokens are physically stored on the client side (e.g., *LocalStorage*).
**•	Server-Side Validation:** The server uses a physical secret key *(app.jwt.secret*) and a 24-hour expiration setting (86400000 ms) to validate incoming tokens at the network boundary.

## 9. SCENARIO VIEW 
# 1. Use Case Diagram

   <img width="605" height="339" alt="image" src="https://github.com/user-attachments/assets/f6113ab7-c913-4f8b-a270-fb7621375bd1" />
 
This diagram identifies the primary actors and their interactions with the system based on the implemented endpoints in the EventsController, AuthController, and CategoriesController.
**•	Guest:** Can browse all events (GET /api/events) and register for a new account (POST /api/auth/register).
**•	Registered User:** Can log in, browse categories, and register for specific events (POST /api/events/{id}/registrations).
**•	Organizer (Event Creator):** A specialized role for a user who creates an event. They have the exclusive right to update or delete their specific events (DELETE /api/events/{id}).


# 2. Integrated Execution Scenario: "Creating a Verified Event"
This scenario demonstrates the synergy between the different architectural views during a standard workflow.
1.	Authentication (Process View): A user sends a LoginRequest to the AuthController. The AuthService validates the credentials and the JwtService issues a token.
2.	Request Authorization (Development & Process View): The user attempts to create an event. The JwtAuthenticationFilter extracts the email from the token, and the SecurityConfig confirms the user is authenticated.
3.	Domain Logic (Logical View): The EventsController receives the Event object. It retrieves the current user's ID from the AppUserRepository and assigns it as the event's appUserId (the organizer).
4.	Persistence & Automated Sync (Physical View): The EventService persists the record to the file-based H2 database (./data/eventdb).
5.	Side-Process Execution: Upon successful database commit, the DataSqlExportService triggers a physical write to the disk, updating the src/main/resources/data.sql file to ensure the development environment remains synchronized.

   <img width="605" height="232" alt="image" src="https://github.com/user-attachments/assets/2f03d5f4-4fac-4001-8a07-eb170639fb40" />

 
# 3. State Machine: "The Persistence Lifecycle"

 <img width="219" height="935" alt="image" src="https://github.com/user-attachments/assets/90a94666-48ae-4521-82fb-5f6f562447f9" />



