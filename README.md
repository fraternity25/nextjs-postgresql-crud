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

```
├── components/
│ ├── ConfirmModal.js # Reusable confirmation dialog
│ ├── icons.js # Centralized icon exports
│ ├── Layout.js # Main app layout with header/sidebar
│ ├── ProfileMenu.js # Dropdown menu for user profile
│ ├── Sidebar.js # Sidebar navigation component
│ ├── SignupForm.js # Signup form component
│ ├── TaskActionSelect.js # Dropdown for task actions
│ ├── TaskList.js # Task listing UI
│ ├── TasksForm/
│ │ ├── CreateForm.js # Form for creating a new task
│ │ └── index.js # Exports task form components
│ ├── TasksLayout.js # Layout for task-related pages
│ ├── Toast.js # Notification/toast component
│ ├── UserActionSelect.js # Dropdown for user actions
│ ├── UserForm.js # Form for adding/editing users
│ ├── UserList.js # User listing UI
│ └── UsersLayout.js # Layout for user-related pages
│
├── contexts/
│ ├── TasksContext.js # Context provider for tasks state
│ └── UsersContext.js # Context provider for users state
│
├── hooks/
│ └── useTasksForm.js # Custom hook for task form logic
│
├── lib/
│ ├── authOptions.js # NextAuth configuration
│ ├── dataService.js # Data access layer with PostgreSQL
│ ├── db.js # Database connection setup
│ └── utils.js # Utility/helper functions
│
├── pages/
│ ├── api/
│ │ ├── auth/
│ │ │ ├── [...nextauth].js # NextAuth API route
│ │ │ └── signup.js # Signup API route
│ │ ├── tasks/
│ │ │ ├── [id].js # Single task API route
│ │ │ ├── [id]/users.js # Manage users for a task
│ │ │ └── tasks.js # Tasks collection API
│ │ ├── users/
│ │ │ └── [id].js # Single user API route
│ │ └── users.js # Users collection API
│ │
│ ├── auth/
│ │ ├── index.js # Auth landing page
│ │ ├── login.js # Login page
│ │ └── signup.js # Signup page
│ │
│ ├── tasks/
│ │ ├── [id]/
│ │ │ ├── edit.js # Edit task page
│ │ │ └── users.js # Assign users to task
│ │ ├── index.js # Tasks list page
│ │ └── new.js # Create task page
│ │
│ ├── users/
│ │ ├── [id]/
│ │ │ ├── edit.js # Edit user page
│ │ │ └── tasks.js # View user’s tasks
│ │ └── index.js # Users list page
│ │
│ ├── profile/
│ │ └── index.js # User profile page
│ │
│ ├── _app.js # Custom App component
│ ├── _document.js # Custom Document
│ └── index.js # Home page
│
├── public/ # Static assets
│
├── scripts/
│ └── seed.js # DB seeding script
│
├── styles/
│ └── globals.css # Global Tailwind styles
│
├── eslint.config.mjs # ESLint configuration
├── jsconfig.json # Path aliases
├── next.config.mjs # Next.js configuration
├── package.json
├── postcss.config.js # PostCSS config for Tailwind
├── tailwind.config.js # Tailwind configuration
└── README.md
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
   - Run the schema from `sql/schema.sql` to create the required tables

4. Configure environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Update the database connection details:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

## Database Setup

### Schema

The application uses the following PostgreSQL schema:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Create an index on email for better performance
CREATE INDEX idx_users_email ON users(email);
```

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Optional: Connection pool settings
DB_POOL_MIN=2
DB_POOL_MAX=10
```

## API Endpoints

### Users Collection (/api/users)
- **GET** - Retrieve all users
- **POST** - Create a new user

### Individual User (/api/users/[id])
- **GET** - Retrieve a specific user
- **PUT** - Update a specific user
- **DELETE** - Delete a specific user

## Data Storage

The application uses PostgreSQL for data persistence with the following features:

- **Connection pooling** for efficient database connections
- **Prepared statements** for security and performance
- **Transaction support** for data integrity
- **Automatic timestamps** for created_at and updated_at fields
- **Email uniqueness** constraint

## Development

### Adding New Fields

To add new fields to the user model:

1. **Update the database schema:**
   ```sql
   ALTER TABLE users ADD COLUMN new_field VARCHAR(255);
   ```

2. **Update the DataService methods** in `lib/dataService.js`

3. **Update the UserForm component** in `components/UserForm.js`

4. **Update the API validation** in `pages/api/users.js` and `pages/api/users/[id].js`

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

## Styling

The app uses Tailwind CSS for styling. All styles are utility-based and responsive.

## Production Deployment

### Database Setup

1. Set up a PostgreSQL database (e.g., using services like AWS RDS, Heroku Postgres, or Supabase)
2. Run the schema creation script
3. Configure the `DATABASE_URL` environment variable

### Environment Variables

Ensure the following environment variables are set in your production environment:

```env
DATABASE_URL=postgresql://username:password@host:port/database_name
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