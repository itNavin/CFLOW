# C-FLOW (Capstone Report Submission System)

The capstone report submission system is designed to streamline and simplify the process of submitting, reviewing, and managing multiple versions of student reports. The system aims to address key pain points faced by administrators, lecturers, and students in managing courses and handling different versions of reports, feedback, and revisions. By creating a user-friendly, real-world system that minimizes confusion, the platform ensures that administrators can efficiently manage courses, and both students and lecturers can easily track the progress of a report and the corresponding feedback.

## Features

### F1. Authentication
- Users can log in using School of Information Technology (SIT) accounts.

---

### F2. User Management
- Administrators can manage user accounts without requiring user self-registration.
- Add users manually include SoLA lecturer.
- Fetch student information into the system.
- Update user status.

---

### F3. Course Management
- Administrators can perform full CRUD (Create, Read, Update, Delete) operations on courses.
- Create a course and assign an academic program.
- Update course information.
- Delete a course.
- Add students, lecturers, and administrators to a course.
- View course information and submission status summary via the dashboard.
- View submission status for each student group.

---

### F4. Student Grouping with Lecturer Assignment
- Administrators can assign students into groups and designate lecturers.
- Download Excel template for group creation.
- Create groups manually or via Excel upload.
- Update group details.
- Delete groups.

---

### F5. Announcements
- Administrators and lecturers can post announcements within a course.
- All enrolled users can view announcements.
- Create announcements with file attachments.
- Update announcements.
- Delete announcements.

---

### F6. File Management
- Administrators and lecturers can upload shared files to a course.
- All enrolled users can access course files.
- Upload files.
- Download files.
- Delete files.

---

### F7. Assignment Creation
- Administrators can manage assignments directly within the system.
- Title and description
- Related files
- Deliverables
- Allowed submission file types
- Due date and end date
- Create assignments.
- Update assignments.
- Delete assignments.

---

### F8. Version Control
- The system automatically tracks and labels each submission version.
- Both students and lecturers can clearly view submission history.
- Students can create submission versions with descriptions and attached files.
- Lecturers can provide feedback within the same version.
- Access to both latest submission and full version history.

---

### F9. Submission
- Students can submit their work under the latest version.
- Add submission descriptions.
- Upload submission files.

---

### F10. Feedback Management
- Lecturers can provide feedback linked to specific submission versions.
- Write feedback comments within the system.
- Upload annotated or feedback files and return them to students.
- Update submission status (e.g., Approved, Approved with Feedback, Not Approved).
- Update assignment due dates.

---

### F11. Automatic File Renaming
- Uploaded files are automatically renamed using a standardized format.

**Examples**
- Student submission  
  - CS program: `G01_Chapter1_V02.pdf`  
  - DSI program: `G0001_Chapter1_V02.pdf`

- Lecturer feedback  
  - CS program: `LecturerName_G01_Chapter1_V02.pdf`  
  - DSI program: `LecturerName_G0001_Chapter1_V02.pdf`

---

### F12. Automated Notifications
- The system automatically notifies users via email and in-system announcements.

## Tech Stack

### Frontend
- **Next.js** (v14.x)
- **React** (v18.x)
- **TypeScript** (v5.x)
- **Tailwind CSS** (v3.4+)

### Backend
- **Bun** (v1.1+)
- **TypeScript** (v5.x)
- **Hono** (v4.x)
- **Nodemailer** (v6.x)

### Database
- **PostgreSQL** (v16.x)

### ORM
- **Prisma** (v5.x)

### Storage
- **MinIO (S3-compatible object storage)** (vRELEASE.2024+)

## Repository Structure

## Frontend Repository Structure

```text
CLOW/
├── .next/                       # Next.js build output
├── node_modules/                # Project dependencies
├── public/                      # Public static assets
│   ├── fonts/                   # Custom fonts
│   ├── image/                   # Images and icons
│   ├── templates/               # Static templates
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── api/                     # API client and service calls
│   ├── app/                     # Next.js App Router (pages, layouts)
│   ├── components/              # Reusable UI components
│   ├── types/                   # TypeScript type definitions
│   └── util/                    # Utility and helper functions
├── .dockerignore                # Docker ignore rules
├── .env                         # Environment variables (not committed)
├── .gitignore                   # Git ignore configuration
├── bun.lockb                    # Bun lock file
├── docker-compose.dev.yml       # Docker Compose (development)
├── dockerfile                   # Production Docker configuration
├── dockerfile.dev               # Development Docker configuration
├── eslint.config.js             # ESLint configuration
├── eslint.config.mjs            # ESLint configuration (ESM)
├── next-env.d.ts                # Next.js TypeScript definitions
├── next.config.ts               # Next.js configuration
├── package.json                 # Project metadata and scripts
├── package-lock.json            # Dependency lock file
├── postcss.config.mjs           # PostCSS configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Project documentation
```

## Frontend Setup

### Install Dependencies
```bash
bun install
```

### Configure environment variables
```bash
NEXT_PUBLIC_API_BASE=http://localhost:8000/api
```

### Run the Frontend
```bash
bun dev
```



