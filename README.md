# Maritime Assign 
<p align="center">
  <img src="https://github.com/Maritime-Assign/ReactProject/blob/main/src/assets/MebaLogoOfficial.png?raw=true" alt="Official_Logo" width="300" height="300"/>
</p>


# Project Overview and Purpose

MaritimeAssign is a web-based job management platform built for the Marine Engineers’ Beneficial Association (MEBA) to replace their outdated Google Sheets-based job board. The application centralizes job listings, streamlines dispatch workflows, and provides secure role-based access for union members, dispatchers, and administrators.
It was created to improve reliability, security, efficiency, and real-time visibility for a nationwide maritime job distribution system.

### What it does:
- Provides a real-time job board with filtering, editing, and claiming capabilities
- Secures access using Supabase authentication and role-based permissions
- Logs all changes through a searchable, filterable job history system
- Offers a display-only union hall mode for public viewing
- Allows admins to manage users, roles, and job dropdown configurations

### Why it was created:
- To replace MEBA’s error-prone, manual Google Sheets workflow
- To reduce data-entry mistakes and prevent unauthorized edits
- To provide a scalable, secure, cloud-hosted solution for MEBA’s operational needs

### DB Schema
<div align="center">
  <img src="src/assets/screenshots/DB SCHEMA.png" alt="Login Page" width="600"/>
</div>


### Project Screenshots

Here are some screenshots of the project in action:

#### Login Page
<div align="center">
  <img src="src/assets/screenshots/LoginPage.png" alt="Login Page" width="600"/>
</div>



#### Data Editing
<div align="center">
  <img src="src/assets/screenshots/AddJob.png" alt="Login Page" width="600"/>
</div>
<div align="center">
  <img src="src/assets/screenshots/EditJob.png" alt="Login Page" width="600"/>
</div>
<div align="center">
  <img src="src/assets/screenshots/EditJobPopup.png" alt="Login Page" width="600"/>
</div>
<div align="center">
  <img src="src/assets/screenshots/AddUser.png" alt="Login Page" width="600"/>
</div>

#### Union Hall Display
<div align="center">
  <img src="src/assets/screenshots/FSBoard.png" alt="Login Page" width="600"/>
</div>

#### Viewing Job History
<div align="center">
  <img src="src/assets/screenshots/ViewHistory.png" alt="Login Page" width="600"/>
</div>
<div align="center">
  <img src="src/assets/screenshots/FullHistory.png" alt="Login Page" width="600"/>
</div>

### Team / Contributors
| Name              | Contact                                                   |
| ----------------- | --------------------------------------------------------- |
| Kevin Jackson     | [kevinjackson@csus.edu](mailto:kevinjackson@csus.edu)     |
| Delon Chisolm     | [delonschisolm@gmail.com](mailto:delonschisolm@gmail.com) |
| Nick Janota       | [jnjanota@gmail.com](mailto:jnjanota@gmail.com)           |
| William Scott     | [wscott@csus.edu](mailto:wscott@csus.edu)                 |
| Phong Ho          | [lyhongyen1979@gmail.com](mailto:lyhongyen1979@gmail.com) |
| Alexandra Allwein | [aallwein1@gmail.com](mailto:aallwein@csus.edu)         |
| Ismaeel Khan      | [IsmaeelNKhan@gmail.com](mailto:IsmaeelNKhan@gmail.com)   |
| Derek Tran        | [derektran@csus.edu](mailto:derektran@csus.edu)           |
| Byron Saylor      | [byrontsaylor@gmail.com](mailto:byrontsaylor@gmail.com)   |



### Running the Project for Testing and Development!!

You can build the project using one of the following methods:

#### Option 1: Build with command line

1. Install Node.js (Version 22 or any even-numbered version).
2. Run `npm install -g npm@11.2.0` to update npm.
3. Install Vite globally: `npm install -g vite`.
4. Install Supabase.js globally: `npm install -g supabase-js`.
5. Install project dependencies: `npm install`.
6. Start the development server: `npm run dev`.
7. The project will be available at `http://localhost:5173`.

#### Option 2: Build with Docker

Refer to the [Docker Instructions](https://github.com/Maritime-Assign/ReactProject/blob/main/README.Docker.md) for detailed steps.
