# Team Task Manager

A full-stack web application designed for teams to create projects, assign tasks, and track progress with role-based access control.

## 🚀 Key Features

*   **Authentication:** Secure Signup & Login powered by Firebase Authentication.
*   **Role-Based Access Control (RBAC):**
    *   **Admin:** Can create/delete projects, create tasks, and assign them to members. Has a global view of all tasks.
    *   **Member:** Can view projects they are involved in and manage tasks specifically assigned to them.
*   **Project & Team Management:** Organize tasks within distinct projects.
*   **Task Management:** Track tasks with statuses (To Do, In Progress, Done) and due dates.
*   **Dashboard:** High-level analytics showing total tasks, completion status, and overdue items.

## 🛠 Tech Stack

*   **Frontend:** React (Vite), React Router DOM, Tailwind CSS v4, Lucide React (Icons).
*   **Backend & Database:** Firebase Firestore (NoSQL).
*   **Authentication:** Firebase Auth.
*   **Deployment:** Ready for Railway (configured with a static `serve` script).

## ⚙️ Installation & Setup (Local)

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd team-task-manager
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` to view it in the browser.

## 🌐 Deployment (Railway)

This application is configured for easy deployment on Railway:
1. Push this repository to GitHub.
2. Go to [Railway](https://railway.app/), create a new project, and select "Deploy from GitHub repo".
3. Railway will automatically detect the Vite build process.
4. Set the Start Command to `npm run start` if not automatically detected.

## 👥 User Roles (For Testing)

*   **Admin:** `Kushaalnp@gmail.com` (Any password you set during signup).
*   **Member:** Any other email registered during signup.

> Note: To test the Admin flow, simply sign up using `Kushaalnp@gmail.com`. The system automatically assigns the 'admin' role to this email. All other new signups default to 'member'.

## 📦 Submission Details

*   **Live URL:** *(Add your Railway URL here after deployment)*
*   **Demo Video:** *(Add your video link here)*
