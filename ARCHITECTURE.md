# Event-Announcement-Site
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
| **Final Part for the Project** | April 10th-26th 2026 | All Team | The project has been further developed, bugs have been fixed, and new features have been added. Our documents are finalized. |

## Table of Contents
1-	Scope

2-	References

3-	Software Architecture

4-	Architectural Goals & Constraints

5-	Logical Architecture

6-	Process Architecture

7-	Development Architecture 

8-	Physical Architecture

9-	Scenarios

10-	Size and Performance

11-	Quality


## Appendices: 
-	Acronyms & Abbreviations
-	Definitions
-	Design Principles


### List of Figures:
### 1. SCOPE

The **Event Announcement System** is a comprehensive full-stack solution designed to streamline the organization and discovery of diverse community events. Developed with a robust **Java 21** and **Spring Boot 3.4.4** backend, the system implements a sophisticated layered architecture that ensures seamless data flow between RESTful controllers and the **H2 database**. The core functionality revolves around a secure user ecosystem where enthusiasts can register, authenticate and manage their own event listings with complete ownership integrity. A standout feature of the technical scope is the **automated synchronization mechanism**, which triggers a physical `data.sql` update after every database transaction to maintain environment consistency across the development lifecycle. On the frontend, the platform offers a responsive, user-centric interface featuring real-time search filters and dynamic navigation bars that adapt to the user's login state. By enforcing strict business rules—such as preventing organizers from registering for their own events—and providing instant visual feedback through an integrated notification system, the project successfully bridges the gap between complex backend persistence and an intuitive, community-driven user experience.

### 2. REFERENCES
| Source Title | Link | 
| :--- | :--- | 
| **What is H2 Database? How is it used?** | https://dileksen3417.medium.com/h2-database-nedir-nas%C4%B1l-kullan%C4%B1l%C4%B1r-99f8cf0a4802| 
| **Creating a REST Service with Java Spring Boot** | https://medium.com/bentego-teknoloji/java-spring-boot-ile-rest-servisi-olu%C5%9Fturmak-f9b737ac982d| 
| **JavaScript Tutorials and Guides** | https://developer.mozilla.org/en-US/docs/Web/HTML https://developer.mozilla.org/en-US/docs/Web/JavaScript|
| **CSS: Cascading Style Sheets** | https://developer.mozilla.org/en-US/docs/Web/CSS| 
| **The 4+1 View Model of Architecture** | https://www.cs.ubc.ca/~gregor/teaching/papers/4+1view-architecture.pdf
| **Spring Boot Framework** | https://spring.io/projects/spring-boot | 
| **JSON Web Token (JWT) Standard** | [tools.ietf.org/html/rfc7519](https://datatracker.ietf.org/doc/html/rfc7519) | 
| **Software Architecture (Wikipedia)** | [en.wikipedia.org/wiki/Software_architecture](https://en.wikipedia.org/wiki/Software_architecture) |
| **HTML5 & Web API Standards** | [html.spec.whatwg.org](https://html.spec.whatwg.org/multipage/) | 

### 3. SOFTWARE ARCHITECTURE

The system follows a **Layered Architecture Style** combined with a **Client-Server** model, ensuring a clear separation of concerns and high maintainability. 

 **A. Logical View (Layered Architecture Style)**
* **Presentation Layer**: The user interface is built with modular HTML, CSS, and vanilla JavaScript, handling user interactions and RESTful API communication.
* **Controller Layer**: Classes like `EventsController` and `AuthController` act as entry points, managing HTTP requests and routing them to appropriate services.
* **Service Layer**: This "brain" of the application, including components like `EventRegistrationService`, enforces business rules, such as preventing event organizers from registering for their own events.
* **Data Access Layer**: Utilizing **Spring Data JPA**, interfaces such as `EventRepository` and `AppUserRepository` abstract database operations from the business logic.

**B. Process View (Stateless & Synchronized Style)**
* **Stateless Communication**: The backend operates without storing session state on the server; instead, it supports continuous identity verification across requests.
* **Transactional Synchronization**: The `DataSqlExportService` creates an automated runtime process where every database commit triggers a physical snapshot update to the `data.sql` file.

**C. Development View (Modular Package Style)**
* **Package Structure**: The project is strictly divided into `com.eventannouncement.model`, `.repository`, `.service`, and `.controller` packages.
* **Structural Consistency**: All domain entities (User, Event, Category) inherit from a common `BaseEntity`, ensuring uniform auditing of IDs and creation dates.

**D. Physical View (Embedded Deployment Style)**
* **Application Server**: The system runs on the provided server.
* **Storage Infrastructure**: Data is persisted in a file-based **H2 Database** located on the local disk at `./data/eventdb`.

 **E. Scenarios**
* **Core Workflow**: When a user registers for an event (Logical), the system validates the request (Process) via specific code layers (Development) and permanently records the transaction in the physical database file (Physical).


### ARCHITECTURE EVOLUTION & FEATURE UPDATES
The Event Announcement System has evolved from a basic functional prototype into a sophisticated, high-integrity Full-Stack Enterprise-Grade platform. This evolution focuses on four main pillars: Security Hardening, Automated Data Integrity, Administrative Governance, and Modern User Experience (UX).
# 1. Structural Foundation & Data Integrity
•	Logical Inheritance (BaseEntity): A major structural shift was the introduction of the BaseEntity abstract class. This unified all domain models (AppUser, Event, Category), ensuring standardized auditing with id, createdDate, and status fields across the entire database schema.
•	Automated Data Synchronization: The implementation of the DataSqlExportService introduced a "Physical Snapshot" mechanism. It utilizes TransactionSynchronizationManager to automatically update the physical data.sql file after every successful database commit, ensuring continuous development environment parity for the entire team.
•	Complex Business Logic: The service layer was expanded with AccountService and EventRegistrationService to manage intricate operations like "Cascading Deletes". When a user deletes their account, the system now automatically purges all associated registrations and hosted events to maintain perfect referential integrity.
# 2. Security & Stateless Authentication
•	Stateless Security Model: The backend was hardened using Spring Security and JWT (JSON Web Token). The SecurityConfig defines a strict stateless session policy, requiring a valid Bearer token for all sensitive operations while keeping public viewing routes accessible.
•	Data Encapsulation: Security was further enhanced at the model level by enforcing WRITE_ONLY constraints on passwords. This ensures that sensitive credentials are never leaked in JSON responses.
# 3. Administrative Ecosystem (Admin Panel)
•	Admin Governance: A dedicated Admin Dashboard (admin.html & admin.js) was introduced to provide high-level management capabilities.
•	Role-Based Access Control: The system now identifies administrative users and dynamically provides access to global event management, user editing, and participant roster controls.
•	Granular Management: Admins and event organizers can now view detailed participant contact information and cancel specific registrations, a feature supported by the specialized EventRegistrantContactDto and corresponding service methods.
# 4. Frontend Engineering & Modern UX (Custom Implementation)
The presentation layer underwent a total transformation to provide a responsive and interactive user experience:
•	Simplified Event Interaction: To reduce user confusion, the redundant mix of Login/Register/Logout buttons on event pages was removed. Guest users are now presented only with a "Register" option, which utilizes the Pending Registration Intent pattern to cache the user's intent, handle the login flow, and automatically prompt them to complete the registration upon their return.
•	Smart Login Feedback & UX: The authentication flow now features an Intelligent Account Guard. If a login attempt fails because an account does not exist, the UI dynamically displays a "Register Prompt" with a shake animation to visually guide the user toward account creation instead of just showing a generic error.
•	Dynamic Identity Navigation (navbar.js): The navigation bar implements Conditional Rendering to adapt to the user's login state. It renders personalized dropdowns, dynamic avatars (or initial-based placeholders), and context-aware links based on the active JWT session.
•	Real-Time Feedback System (toast.js & toast.css): A custom, non-blocking Toast Notification System replaced intrusive browser alerts. It provides color-coded, animated feedback (Success, Error, Info) with smooth cubic-bezier transitions.
•	Adaptive Content & Theming:
Theme Engine: Persistent Dark/Light Mode support was integrated using localStorage and CSS variables.
Intelligent Asset Handling: The system utilizes a Category-Based Image Resolver, automatically selecting high-quality sport-specific fallbacks (e.g., Football, Basketball, Tennis) if a custom image URL is not provided.


| Component      | Technical Implementation                          | Result                                                      |
|----------------|--------------------------------------------------|-------------------------------------------------------------|
| Security       | JWT + Spring Security Filter Chain               | Stateless, token-based secure access.                       |
| UX Logic       | Pending Intent & Shake Animation                 | Reduced user friction and smart account guidance.           |
| UI Feedback    | Custom Toast System                             | Professional, real-time status updates without blocking.    |
| Data Sync      | Transactional data.sql Auto-Export              | Automated team-wide database parity.                        |
| Admin Layer    | Role-Based Dashboard & CRUD                     | Centralized system and event governance.                    |
| Integrity      | Cascading Service-Level Deletion                | Zero orphaned records across the domain.                    |
| Logic          | Adaptive Image Fallbacks                        | High-quality visual consistency for all categories.         |
  
### 4. ARCHITECTURAL GOALS & CONSTRAINTS

| Goal/Constraint | Feature | Description |
| :--- | :--- | :--- |
| **Architectural Goal** | **Data Consistency & Sync** | Ensuring that the application's physical state always matches the database via the automated `DataSqlExportService`. |
| **Architectural Goal** | **Strict Business Logic Integrity** | Enforcing domain rules at the service layer, such as preventing organizers from registering for their own events. |
| **Architectural Goal** | **Stateless Security** | Providing secure access without server-side session overhead by implementing JWT-based authentication. |
| **Architectural Goal** | **System Maintainability** | Utilizing a layered package structure and `BaseEntity` inheritance to simplify future updates and debugging. |
| **Architectural Goal** | **Resource Decoupling** | Separating the frontend static assets from the backend logic to enable independent UI development and testing. |
| **Architectural Goal** | **Relational Reliability** | Using JPA constraints and Hibernate listeners to manage complex relationships between users, events, and categories. |
| **Constraint** | **Language & Framework** | The system must be developed strictly using **Java 21** and **Spring Boot 3.4.4**. |
| **Constraint** | **Database Selection** | Persistence is limited to a file-based **H2 Database** located at `./data/eventdb` for lightweight deployment. |
| **Constraint** | **Security Protocol** | Authentication must be handled through the `JwtAuthenticationFilter` with stateless session management. |
| **Constraint** | **Physical Resource Path** | Static frontend resources must be served from an external file path (`../frontend/`) as defined in system properties. |


### 5. ARCHITECTURAL DOCUMENTATION: LOGICAL VIEW
# A. Domain Model and Data Structure
The core of the system is built on a robust entity-relationship model that manages the lifecycle of events, user interactions, and administrative governance.
•	**Foundation (BaseEntity):** All domain objects inherit from this abstract superclass. It ensures that every record in the system possesses a unique identity (ID), a record of creation (createdDate), and an operational status flag to maintain auditability.
•	**User Lifecycle (AppUser):** Represents the primary actor with expanded profile capabilities. It manages personal credentials, profile image paths, and acts as the "Organizer" for events through a One-to-Many relationship.
•	**Event Core (Event):** The central entity holding metadata such as title, location, and timing. It maintains Many-to-One relationships with Categories and Organizers, supporting dynamic image resolution based on category types.
•	**Administrative Taxonomy (Category):** Provides a logical grouping for sports events (e.g., Football, Basketball). It allows for structured data retrieval and is managed via an Admin-only interface for system-wide consistency.
•	**Participation Logic (EventRegistration):** A junction entity used to bridge users and events. It enforces referential integrity to ensure unique participation records and supports organizer-led cancellation workflows.

# B. Service Layer & Business Intelligence
The Service layer serves as the "brain" of the application, encapsulating complex business rules and account lifecycle management.
•	**Account & Profile Management (AccountService):**
Profile Orchestration: Manages user profile updates, including physical image persistence and account data synchronization.
Cascading Account Deletion: Implements a complex cleanup logic where deleting a user account automatically purges all associated registrations and hosted events to prevent orphaned data.
•	**Identity & Security (AuthService):**
Stateless Authorization: Integrates with JWT logic to provide secure, token-based access. It handles email normalization and sensitive credential protection via WRITE_ONLY constraints.
•	**Registration Intelligence (EventRegistrationService):**
Ownership Guard: Logically prevents organizers from registering for their own events.
Contact Exposure: Provides organizers with secure access to participant contact details (email/phone) for logistical coordination.

# C. API Design & Functional Exposure
•	**Events & Registrations (EventsController):** Provides comprehensive endpoints for the event lifecycle, including participant management and organizer-only deletion rights.
•	**Account & Admin Gateway (AccountController & Admin.js):**
Personalized Dashboard: Manages the /api/account/me endpoints for user self-service and profile customization.
Administrative Control: Dedicated modules provide privileged access for system-wide event editing and participant removal.
•	**Resource Management (UploadController):** Handles Multipart file uploads for profile and event images, enforcing size and MIME-type constraints.
•	**Taxonomy Exposure (CategoriesController):** Exposes the system's category structure, supporting dynamic frontend filtering and metadata mapping.

# D. Automated Developer Tooling
•	**Transaction Synchronization:** Through the use of TransactionSynchronizationManager, the system tracks successful database commits.
•	**Physical State Parity:** The DataSqlExportService automatically exports the H2 database state into a physical data.sql file after each successful transaction. This ensures that the logical state of the development environment (including 100+ seeded sport events) is always preserved and synchronized via version control.


 <img width="606" height="795" alt="image" src="https://github.com/user-attachments/assets/19dc31f4-f0f1-4c4c-8096-d043ca2a179b" />


### 6. ARCHITECTURAL DOCUMENTATION: PROCESS VIEW
# A. Request Processing Lifecycle
The system operates as a stateless web application where each HTTP request is handled in an independent execution thread.
•	Filter Chain Execution: Every incoming request first passes through the *SecurityConfig* filter chain.
•	Authentication Process: The *JwtAuthenticationFilter* intercepts requests to extract the "Bearer" token. It uses the *JwtService* to validate the token and extract the user's email. If valid, an Authentication object is injected into the SecurityContextHolder, allowing subsequent layers to identify the user.
•	Authorization: The *SecurityConfig* defines rules (e.g., *.authenticated()*) that processes must satisfy before reaching the Controller layer.
# B. Transaction and State Synchronization
•	Hibernate Event Interception: When a user performs an action that modifies data (*INSERT, UPDATE, DELETE*), Hibernate's *DataSqlExportEventListener* captures the event.
•	Post-Commit Synchronization: To ensure data integrity, the system does not export the file during an active transaction. Instead, the *DataSqlExportService* uses *TransactionSynchronizationManager* to schedule the export process only after a successful database commit (*afterCommit*).

<img width="605" height="318" alt="image" src="https://github.com/user-attachments/assets/d086778e-9486-4fe4-bd99-9bea99c76cc8" />

 
# C. Concurrency and Resource Management
•**Statelessness:** By utilizing SessionCreationPolicy.STATELESS, the system avoids server-side session overhead, allowing each process to be fully contained within the request thread.
•	**Thread Safety:**
o	Services: All services are managed as singleton beans by Spring, requiring thread-safe implementation.
o	Locking: The exportLock in the *DataSqlExportService* ensures that the "Export Process" is thread-safe, even when multiple administrative or user actions occur simultaneously.
•	**Database Isolation:** H2 database interactions are managed through *JdbcTemplate* and Spring Data JPA, ensuring that standard ACID properties are maintained during concurrent data access.
# D. Key Runtime Sequences
The interactions between processes can be summarized in two main flows:
**D.1. Authentication Flow**
1.	Client sends credentials to /api/auth/login.
2.	*AuthService* validates the password.
3.	*JwtService* generates a signed token.
4.	Process returns a 200 OK with the token to the client.

**D.2. Event Creation & Export Flow**
1.	Authorized User sends an event object to /api/events.
2.	EventService begins a transaction and saves the entity via *EventRepository*.
3.	Post-Insert Event is triggered; *DataSqlExportService* binds an export task to the current transaction.
4.	Transaction Commits: The database is updated.
5.	Export Thread executes: The data.sql file is overwritten with the latest snapshot of all tables (*categories, app_users, events, event_registrations*).


### 7. ARCHITECTURAL DOCUMENTATION: DEVELOPMENT VIEW
# A. Module Decomposition & Layering Strategy
•	Presentation Layer (*com.eventannouncement.controller*): Manages RESTful API endpoints. Controllers like *EventsController* and *AuthControlle*r handle HTTP request mapping and JSON serialization.
•	Business Logic Layer (*com.eventannouncement.service*): Encapsulates the core intelligence of the application. Services such as *EventService* and *EventRegistrationService* perform validation and coordinate data flow between layers.
•	Data Access Layer (*com.eventannouncement.repository*): Utilizes Spring Data JPA to abstract database operations. Interfaces like *AppUserRepository* and *EventRepository* provide standard CRUD and custom query capabilities.
•	Model Layer (*com.eventannouncement.model*): Contains the blueprint of the system. This includes the *BaseEntity* for auditability and domain-specific entities like *AppUser* and *Event*.
•	Infrastructure & Configuration (*com.eventannouncement.config & .security*): Houses cross-cutting concerns like JWT security filters and the specialized Hibernate event listeners for SQL exporting.
# B. Technology Stack & Dependency Management
The system is developed using Java 21 and Spring Boot 3.4.4, managed primarily through Gradle (as seen in *build.gradle*), with legacy support for Maven (*pom.xml*).
•	Spring Boot Starters: Uses spring-boot-starter-web for REST APIs, spring-boot-starter-data-jpa for ORM, and spring-boot-starter-security for protection.
•	JSON Web Tokens (JWT): Implements io.jsonwebtoken (JJWT) for secure, stateless authentication.
•	Database: Employs an H2 In-Memory Database to facilitate rapid development and testing without requiring external database installation.
# C. Specialized Developer Tooling
•	*DataSqlExportService*: This internal utility monitors the database state. Whenever an *INSERT, UPDATE, or DELETE* occurs, it triggers a refresh of the *src/main/resources/data.sql* file.

# D. Source Code Organization

| Package | Responsibility |
| :--- | :--- |
| **com.eventannouncement.dto** | Contains Data Transfer Objects (DTOs) for API requests and responses, such as *LoginRequest* and *AuthResponse*. |
| **com.eventannouncement.security** | Manages security filters, JWT extraction logic, and global authentication configurations. |
| **com.eventannouncement.config**| Configures system-wide Spring beans and Hibernate-level event listeners for the SQL export utility. |
| **resources/** | Holds the *application.properties* configuration file and the auto-generated *data.sql* database snapshot. |

# E. Build and Deployment Artifacts
•	Version Control: The .gitignore is specifically configured to ignore build artifacts (like the build/ and out/ folders) while preserving essential project metadata.
•	Artifact Type: The project compiles into a single executable JAR file containing the embedded Tomcat server, making it ready for "Zero-Install" deployment.



### 8. PHYSICAL VIEW: DEPLOYMENT & INFRASTRUCTURE
# A. Runtime Environment & Processing
**•	Execution Unit:** The system is packaged as a single Executable JAR file, which includes all necessary libraries and an embedded web server.
**•	Java Runtime:** Requires Java Runtime Environment (JRE) 21 as the host environment.
**•	Web Server:** Uses an Embedded Tomcat 10 server, physically bound to Port 8081 (as configured in server.port=8081).
**•	Platform Independence:** Because it runs on the JVM, the application can be physically deployed on any OS (Windows, Linux, macOS) or within a Docker container.
# B. Network Topology & Communication
The system follows a Client-Server model over a TCP/IP network.
**•	Client Access:** Users interact with the system via a web browser or API client over HTTP.
**•	Frontend-Backend Mapping:** While the API is hosted at the root, the application is physically configured to serve static frontend assets from a specific external directory (../frontend/) via the spring.web.resources.static-locations setting.
**•	CORS Policy:** The physical communication is governed by a flexible CORS policy that allows cross-origin requests from any source (*), facilitating integration with various frontend hosting scenarios.
# C. Physical Storage & Persistence Strategy
The application employs a dual-layered persistence strategy to balance performance with data portability.
**•	Primary Database (H2):**
o	Storage Type: File-based persistence.
o	Physical Location: Data is saved to the host machine's disk at ./data/eventdb. This ensures that data survives application restarts, unlike purely in-memory configurations.
**•	State Snapshot (*data.sql*):**
o	Automated Export: Every data modification triggers a physical write to src/main/resources/data.sql.
o	Utility: This file acts as a version-controlled physical backup that allows developers to synchronize database states across different physical machines using Git.
# D. Security Configuration
**•	Token Storage:** Tokens are physically stored on the client side (e.g., *LocalStorage*).
**•	Server-Side Validation:** The server uses a physical secret key *(app.jwt.secret*) and a 24-hour expiration setting (86400000 ms) to validate incoming tokens at the network boundary.

### 9. SCENARIO VIEW 
# A. Use Case Diagram

   <img width="605" height="339" alt="image" src="https://github.com/user-attachments/assets/f6113ab7-c913-4f8b-a270-fb7621375bd1" />
 
This diagram identifies the primary actors and their interactions with the system based on the implemented endpoints in the EventsController, AuthController, and CategoriesController.
**•	Guest:** Can browse all events (GET /api/events) and register for a new account (POST /api/auth/register).
**•	Registered User:** Can log in, browse categories, and register for specific events (POST /api/events/{id}/registrations).
**•	Organizer (Event Creator):** A specialized role for a user who creates an event. They have the exclusive right to update or delete their specific events (DELETE /api/events/{id}).


# B. Integrated Execution Scenario: "Creating a Verified Event"
1.	Authentication (Process View): A user sends a LoginRequest to the AuthController. The AuthService validates the credentials and the JwtService issues a token.
2.	Request Authorization (Development & Process View): The user attempts to create an event. The JwtAuthenticationFilter extracts the email from the token, and the SecurityConfig confirms the user is authenticated.
3.	Domain Logic (Logical View): The EventsController receives the Event object. It retrieves the current user's ID from the AppUserRepository and assigns it as the event's appUserId (the organizer).
4.	Persistence & Automated Sync (Physical View): The EventService persists the record to the file-based H2 database (./data/eventdb).
5.	Side-Process Execution: Upon successful database commit, the DataSqlExportService triggers a physical write to the disk, updating the src/main/resources/data.sql file to ensure the development environment remains synchronized.

   <img width="605" height="232" alt="image" src="https://github.com/user-attachments/assets/2f03d5f4-4fac-4001-8a07-eb170639fb40" />

 
# C. State Machine: "The Persistence Lifecycle"

 <img width="219" height="935" alt="image" src="https://github.com/user-attachments/assets/90a94666-48ae-4521-82fb-5f6f562447f9" />

### 10. SIZE AND PERFORMANCE

| Category | Feature | Analysis & Metrics |
| :--- | :--- | :--- |
| **System Size** | **Data Footprint** | Persistence is managed via a file-based H2 database (`./data/eventdb`). The initial footprint is minimal (< 5MB / ~2.0 MB raw), scaling linearly with user-generated events and registrations. |
| **System Size** | **Resource Efficiency** | Built with vanilla JavaScript and CSS, the frontend avoids heavy frameworks. This results in extremely low bundle sizes (~185 KB total payload), ensuring rapid page loads and high performance. |
| **System Size** | **Backend Executable** | The system is compiled into a standalone Spring Boot JAR (~42.5 MB), optimized for lightweight deployment and compatible with environments supporting Java 21+. |
| **Performance** | **Response Latency** | The stateless **JWT-based authentication** architecture eliminates server-side session overhead, targeting an API response time of **< 100ms** for CRUD operations. |
| **Performance** | **I/O Efficiency** | The `DataSqlExportService` runs synchronously after commits to ensure data safety. It is optimized to handle medium-scale snapshots without blocking the main execution thread. |
| **Performance** | **Search Optimization** | The system employs a "local-data-filtering" strategy where event data is fetched in bulk and filtered in-memory via `script.js`. This eliminates redundant API calls during searching, providing an instantaneous user experience. |


### 11. QUALITY

| Quality Attribute | Feature / Implementation | Description |
| :--- | :--- | :--- |
| **Security** | **JWT & Password Hashing** | Ensures secure, stateless authentication and protects user credentials using industry-standard hashing and WRITE_ONLY property constraints. |
| **Integrity** | **Business Rule Enforcement** | Validates logical constraints, such as preventing duplicate event registrations and ensuring organizers cannot register for their own events. |
| **Maintainability** | **Layered Architecture** | The separation of Controller, Service, and Repository layers allows for isolated updates and easier debugging without affecting the entire system. |
| **Reliability** | **JSR-303 Validation** | Prevents corrupted data from entering the system by enforcing strict format and null-checks on incoming Data Transfer Objects (DTOs). |
| **Auditability** | **BaseEntity Inheritance** | Automatically tracks system-wide metadata, including creation dates and record statuses for every entity in the database. |
| **Scalability** | **ORM Abstraction** | Using Spring Data JPA and Hibernate ensures that the system can transition from H2 to enterprise databases (PostgreSQL/MySQL) with minimal code changes. |
| **Robustness** | **Exception Handling** | Implements a centralized error handling mechanism to provide consistent JSON error responses and prevent internal stack traces from being exposed. |

* **Resource efficiency** is achieved by the choice of **Vanilla JS** and a file-based **H2 database**.
* **Data safety** is ensured by a custom `DataSqlExportService`.

### 12. APPENDICES

#### A. Acronyms and Abbreviations

| Acronym | Description |
|---------|-------------|
| UI | User Interface |
| API | Application Programming Interface |
| REST | Representational State Transfer |
| DB | Database |
| CRUD | Create, Read, Update, Delete |
| HTTP | HyperText Transfer Protocol |
| JSON | JavaScript Object Notation |
| HTML | HyperText Markup Language |
| CSS | Cascading Style Sheets |
| JS | JavaScript |
| Java | A programming language used for backend development |



#### B. Definitions

| Term | Definition |
|------|------------|
| User | An individual who registers and interacts with the system by creating or managing events. |
| Event | A data entity representing an activity created by a user. |
| Authentication | The process of verifying user identity using login credentials. |
| Authorization | The control mechanism that restricts actions based on user ownership. |
| REST API | An architectural style used for communication between client and server. |
| API Endpoint | A specific URL used to perform operations such as retrieving or sending data. |
| Request | A message sent from the client to the server. |
| Response | A message returned from the server to the client. |
| Controller | A component that handles incoming HTTP requests and returns responses. |
| Service Layer | A layer that contains business logic and interacts with the controller. |
| CRUD Operations | Basic operations including Create, Read, Update, and Delete. |
| Navbar | A navigation component used to move between pages. |
| Toast Notification | A small message displayed to inform users about actions such as success or errors. |
| LocalStorage | A browser-based storage used to persist application data. |
| JWT | A token-based authentication mechanism used for secure communication |
| H2 Database | A lightweight file-based database used for development and testing |



#### C. Design Principles

##### C.1 Usability
The system is designed with a user-centered approach to ensure an intuitive and easy-to-use interface, allowing users to navigate and perform actions without prior technical knowledge.

##### C.2 Simplicity
Only essential functionalities are implemented to minimize system complexity and enhance usability.

##### C.3 Modularity
The application is structured into independent modules such as controller, service, and user interface components.

##### C.4 Reusability
Functions and logic are implemented in a reusable manner to reduce redundancy and support scalability.

##### C.5 Maintainability
The codebase is organized and structured to facilitate easy updates, debugging, and future enhancements.

##### C.6 Security Considerations
Basic security mechanisms, including authentication and user-based authorization, are implemented to protect system integrity.

##### C.7 Client-Side Efficiency
Browser-based storage (LocalStorage) is utilized to ensure fast data access and efficient client-side operations.

##### C.8 Feedback Mechanism
The system provides immediate feedback to users through toast notifications for actions such as login, logout, and event creation.

##### C.9 RESTful Design
The backend follows RESTful principles by providing structured API endpoints for CRUD operations.
