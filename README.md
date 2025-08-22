# Next.js CRUD App with PostgreSQL

This is a full-stack CRUD application built with [Next.js](https://nextjs.org) and bootstrapped with [create-next-app](https://nextjs.org/docs/pages/api-reference/create-next-app). It's using the Page Router, JavaScript, Tailwind CSS and PostgreSQL as the database backend.

## Features

- ✅ Create, Read, Update, Delete (CRUD) operations for users
- ✅ Responsive design with Tailwind CSS
- ✅ Form validation and error handling
- ✅ PostgreSQL database with proper schema
- ✅ API routes for backend functionality
- ✅ Database connection pooling
- ✅ Environment-based configuration

## Project Structure

<details>
   <summary>
      <strong>📁 components/</strong>
   </summary>
   ```
   `ConfirmModal.js` # Reusable confirmation dialog
   `icons.js` # Centralized icon exports
   `Layout.js` # Main app layout with header/sidebar
   `ProfileMenu.js` # Dropdown menu for user profile
   `Sidebar.js` # Sidebar navigation component
   `SignupForm.js` # Signup form component
   `TaskActionSelect.js` # Dropdown for task actions
   `TaskList.js` # Task listing UI
   ```
   <details>
      <summary>
         <strong>📁 TasksForm/</strong>
      </summary>
      ```
      `CreateForm.js` # Form for creating a new task
      `index.js` # Exports task form components
      ```
   </details>
   ```
   `TasksLayout.js` # Layout for task-related pages
   `Toast.js` # Notification/toast component
   `UserActionSelect.js` # Dropdown for user actions
   `UserForm.js` # Form for adding/editing users
   `UserList.js` # User listing UI
   `UsersLayout.js` # Layout for user-related pages
   ```
</details>

<details>
   <summary>
      <strong>📁 contexts/</strong>
   </summary>
   ```
   `TasksContext.js` # Context provider for tasks state
   `UsersContext.js` # Context provider for users state
   ```
</details>

<details>
   <summary>
      <strong>📁 hooks/</strong>
   </summary>
   ```
   `useTasksForm.js` # Custom hook for task form logic
   ```
</details>

<details>
   <summary>
      <strong>📁 lib/</strong>
   </summary>
   ```
   `authOptions.js` # NextAuth configuration
   `dataService.js` # Data access layer with PostgreSQL
   `db.js` # Database connection setup
   `utils.js` # Utility/helper functions
   ```
</details>

<details>
   <summary>
      <strong>📁 pages/</strong>
   </summary>
   <details>
      <summary>
         <strong>📁 api/</strong>
      </summary>
      <details>
         <summary>
            <strong>📁 auth/</strong>
         </summary>
         ```
         `[...nextauth].js` # NextAuth API route
         `signup.js` # Signup API route
         ```
      </details>
      <details>
         <summary>
            <strong>📁 tasks/</strong>
         </summary>
         ```
         `[id].js` # Single task API route   
         `[id]/users.js` # Manage users for a task
         `tasks.js` # Tasks collection API
         ```
      </details>
      <details>
         <summary>
            <strong>📁 users/</strong>
         </summary>
         ```
         `[id].js` # Single user API route
         `users.js` # Users collection API
         ```
      </details>
   </details>

   <details>
      <summary>
         <strong>📁 auth/</strong>
      </summary>
      ```
      `index.js` # Auth landing page
      `login.js` # Login page
      `signup.js` # Signup page
      ```
   </details>

   <details>
      <summary>
         <strong>📁 tasks/</strong>
      </summary>
      <details>
         <summary>
            <strong>📁 [id]/</strong>
         </summary>
         ```
         `edit.js` # Edit task page
         `users.js` # Assign users to task
         ```
      </details>
      ```
      `index.js` # Tasks list page
      `new.js` # Create task page
      ```
   </details>

   <details>
      <summary>
         <strong>📁 users/</strong>
      </summary>
      <details>
         <summary>
            <strong>📁 [id]/</strong>
         </summary>
         ```
         `edit.js` # Edit user page
         `tasks.js` # View user's tasks
         ```
      </details>
      ```
      `index.js` # Users list page
      ```
   </details>

   <details>
      <summary>
         <strong>📁 profile/</strong>
      </summary>
      ```
      `index.js` # User profile page
      ```
   </details>
   ```
   `_app.js` # Custom App component
   `_document.js` # Custom Document
   `index.js` # Home page
   ```
</details>

<details>
   <summary>
      <strong>📁 public/</strong> # Static assets
   </summary>
</details>

<details>
   <summary>
      <strong>📁 scripts/</strong>
   </summary>
   ```
   `seed.js` # DB seeding script
   ```
</details>

<details>
   <summary>
      <strong>📁 styles/</strong>
   </summary>
   ```
   `globals.css` # Global Tailwind styles
   ```
</details>
```
`eslint.config.mjs` # ESLint configuration
`jsconfig.json` # Path aliases
`next.config.mjs` # Next.js configuration
`package.json`
`postcss.config.js` # PostCSS config for Tailwind
`tailwind.config.js` # Tailwind configuration
`README.md`
```

## Getting Started
### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- PostgreSQL (version 12 or higher)

### Installation

1. Clone or create the project directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up PostgreSQL database:
   - Create a new PostgreSQL database
   - Run the seed script to create the required tables and demo data: `node scripts/seed.js` 
   
4. Configure environment variables:
   - Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Database Configuration
   PGHOST=localhost
   PGUSER=user_in_pgadmin
   PGPASSWORD=password_of_pgadmin
   PGDATABASE=nextcrud
   PGPORT=5432
   NEXTAUTH_SECRET=your_secret_key
   # Optional: Connection pool settings
   DB_POOL_MIN=2
   DB_POOL_MAX=10
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

## Database Setup
Tables are created and seeded using scripts/seed.js.

```sql
-- Optional: Create an index on email for better performance
CREATE INDEX idx_users_email ON users(email);
```

## API Endpoints
### Users Collection (`/api/users`)
- **GET**: Retrieve all users
- **POST**: Create a new user

### Individual User (`/api/users/[id]`)
- **GET**: Retrieve a specific user
- **PUT**: Update a specific user
- **DELETE**: Delete a specific user

### Tasks Collection (`/api/tasks`)
- **GET**: Retrieve all tasks
- **POST**: Create a new task

### Individual Task (`/api/tasks/[id]`)
- **GET**: Retrieve a specific task
- **PUT**: Update a specific task
- **DELETE**: Delete a specific task

### Task Users (`/api/tasks/[id]/users`)
- **GET**: List users assigned to a task
- **POST**: Assign a user to a task
- **DELETE**: Remove a user from a task

### Authentication (`/api/auth`)
- **POST** `/auth/signup`: Register new user
- `[...nextauth].js`: NextAuth handler for login/session

## Data Storage
The application uses PostgreSQL for data persistence with the following features:
- **Connection pooling** via pg.Pool (lib/db.js)
- **Prepared statements** for security and performance
- **Transaction support** for data integrity
- **Automatic timestamps** for created_at and updated_at fields
- **Email uniqueness** constraint

## Development
### Adding New Fields
To add new fields to the user model:
1. **Update database schema (via a migration or directly in scripts/seed.js)**
2. **Update data access methods** in `lib/dataService.js`
3. **Update forms** in `components/UserForm.js, components/TasksForm/`
4. **Update API routes** in `pages/api/...`
5. **Update the display components** as needed

### Database Migrations
For production deployments, consider implementing a migration system:

1. Create migration files in a `migrations/` directory
2. Use tools like `node-pg-migrate` or `knex.js` for migration management
3. Run migrations as part of your deployment process

### Performance Optimization
- Use connection pooling (already configured in `lib/db.js`)
- Add database indexes for frequently queried fields
- Consider implementing caching for read-heavy operations
- Use pagination for large datasets

### Security Considerations
- Environment variables are used for database credentials
- Prepared statements prevent SQL injection
- Input validation is implemented in API routes
- Email uniqueness is enforced at the database level

## Production Deployment
### Database Setup
1. Set up a PostgreSQL database (e.g., using services like AWS RDS, Heroku Postgres, or Supabase)
2. Run the schema creation script
3. Environment variables needed in production:

```env
DATABASE_URL=postgresql://username:password@host:port/database_name
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

### Deployment Platforms
This app can be deployed on:
- Vercel (recommended for Next.js)
- Netlify
- AWS
- Heroku
- Any Node.js hosting platform

Make sure your hosting platform supports PostgreSQL connections and environment variables.

## Troubleshooting
### Common Issues
1. **Database connection errors:**
   - Verify DATABASE_URL is correct
   - Ensure PostgreSQL is running
   - Check firewall settings
2. **Schema errors:**
   - Ensure the database schema is properly created
   - Check table and column names match the code
3. **Environment variable issues:**
   - Verify `.env.local` exists and has correct values
   - Restart the development server after changes

### Development Tips
- Check the browser's network tab for API request/response details
- Use PostgreSQL logs to debug database-related issues
- Consider using a database GUI tool like pgAdmin for easier database management

## Learn More
To learn more about Next.js, take a look at the following resources:
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.
You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js)

## License
This project is open source and available under the [MIT License](LICENSE).