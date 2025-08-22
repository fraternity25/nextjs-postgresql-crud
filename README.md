# Next.js CRUD App with PostgreSQL
This is a full-stack CRUD application built with [Next.js](https://nextjs.org) and bootstrapped with [create-next-app](https://nextjs.org/docs/pages/api-reference/create-next-app). It's using the Page Router, JavaScript, Tailwind CSS and PostgreSQL as the database backend.

<details>
  <summary class="cursor-pointer font-semibold text-lg">
    <h2>Features</h2>
  </summary>
  <ul>
    <li>✅ Create, Read, Update, Delete (CRUD) operations for users</li>
    <li>✅ Responsive design with Tailwind CSS</li>
    <li>✅ Form validation and error handling</li>
    <li>✅ PostgreSQL database with proper schema</li>
    <li>✅ API routes for backend functionality</li>
    <li>✅ Database connection pooling</li>
    <li>✅ Environment-based configuration</li>
  </ul>
</details>
<details>
  <summary class="cursor-pointer font-semibold text-lg">
   <h2>Getting Started</h2>
  </summary>
  <details>
    <summary class="cursor-pointer font-semibold text-lg">
      <h3>Prerequisites</h3>
    </summary>
    <ul>
      <li>Node.js (version 14 or higher)</li>
      <li>npm or yarn</li>
      <li>PostgreSQL (version 12 or higher)</li>
    </ul>
  </details>
  <details>
    <summary class="cursor-pointer font-semibold text-lg">
      <h3>Installation</h3>
    </summary>
    <ol>
      <li>Clone or create the project directory</li>
      <li>Install dependencies:
        <pre><code>npm install</code></pre>
      </li>
      <li>Set up PostgreSQL database:
        <ul>
          <li>Create a new PostgreSQL database</li>
          <li>Run the seed script: <code>node scripts/seed.js</code></li>
        </ul>
      </li>
      <li>Configure environment variables:
        <pre><code># Database Configuration
PGHOST=localhost
PGUSER=user_in_pgadmin
PGPASSWORD=password_of_pgadmin
PGDATABASE=nextcrud
PGPORT=5432
NEXTAUTH_SECRET=your_secret_key
# Optional: Connection pool settings
DB_POOL_MIN=2
DB_POOL_MAX=10</code></pre>
      </li>
      <li>Run the development server:
        <pre><code>npm run dev</code></pre>
      </li>
      <li>
         Open <a href="http://localhost:3000">http://localhost:3000</a> in your browser
         You can start editing the page by modifying <code>pages/index.js</code>. The page auto-updates as you edit the file.
      </li>
    </ol>
  </details>
</details>
<details>
  <summary class="cursor-pointer font-semibold text-lg">
   <h2>Database Setup</h2>
  </summary>
  <p>Tables are created and seeded using <code>scripts/seed.js</code>.</p>
  <pre><code>-- Optional: Create an index on email for better performance
CREATE INDEX idx_users_email ON users(email);
</code></pre>
</details>
<details>
   <summary class="cursor-pointer font-semibold text-lg">
      <h2>Project Structure</h2>
   </summary>
   <details>
      <summary><strong>📁 components/</strong></summary>
      <ul>
         <li>ConfirmModal.js – Reusable confirmation dialog</li>
         <li>icons.js – Centralized icon exports</li>
         <li>Layout.js – Main app layout with header/sidebar</li>
         <li>ProfileMenu.js – Dropdown menu for user profile</li>
         <li>Sidebar.js – Sidebar navigation component</li>
         <li>SignupForm.js – Signup form component</li>
         <li>TaskActionSelect.js – Dropdown for task actions</li>
         <li>TaskList.js – Task listing UI</li>
         <li>
            <details>
               <summary><strong>📁 TasksForm/</strong></summary>
               <ul>
                  <li>CreateForm.js – Form for creating a new task</li>
                  <li>index.js – Exports task form components</li>
               </ul>
            </details>
         </li>
         <li>TasksLayout.js – Layout for task-related pages</li>
         <li>Toast.js – Notification/toast component</li>
         <li>UserActionSelect.js – Dropdown for user actions</li>
         <li>UserForm.js – Form for adding/editing users</li>
         <li>UserList.js – User listing UI</li>
         <li>UsersLayout.js – Layout for user-related pages</li>
      </ul>
   </details>
   <details>
      <summary><strong>📁 contexts/</strong></summary>
      <ul>
         <li>TasksContext.js – Context provider for tasks state</li>
         <li>UsersContext.js – Context provider for users state</li>
      </ul>
   </details>
   <details>
      <summary><strong>📁 hooks/</strong></summary>
      <ul>
         <li>useTasksForm.js – Custom hook for task form logic</li>
      </ul>
   </details>
   <details>
      <summary><strong>📁 lib/</strong></summary>
      <ul>
         <li>authOptions.js – NextAuth configuration</li>
         <li>dataService.js – Data access layer with PostgreSQL</li>
         <li>db.js – Database connection setup</li>
         <li>utils.js – Utility/helper functions</li>
      </ul>
   </details>
   <details>
      <summary><strong>📁 pages/</strong></summary>
      <ul>
         <li>
            <details>
               <summary><strong>📁 api/</strong></summary>
               <ul>
                  <li>
                     <details>
                        <summary><strong>📁 auth/</strong></summary>
                        <ul>
                           <li>[...nextauth].js – NextAuth API route</li>
                           <li>signup.js – Signup API route</li>
                        </ul>
                     </details>
                  </li>
                  <li>
                     <details>
                        <summary><strong>📁 tasks/</strong></summary>
                        <ul>
                           <li>[id].js – Single task API route</li>
                           <li>[id]/users.js – Manage users for a task</li>
                           <li>tasks.js – Tasks collection API</li>
                        </ul>
                     </details>
                  </li>
                  <li>
                     <details>
                        <summary><strong>📁 users/</strong></summary>
                        <ul>
                           <li>[id].js – Single user API route</li>
                           <li>users.js – Users collection API</li>
                        </ul>
                     </details>
                  </li>
               </ul>
            </details>
         </li>
         <li>
            <details>
               <summary><strong>📁 auth/</strong></summary>
               <ul>
                  <li>index.js – Auth landing page</li>
                  <li>login.js – Login page</li>
                  <li>signup.js – Signup page</li>
               </ul>
            </details>
         </li>
         <li>
            <details>
               <summary><strong>📁 tasks/</strong></summary>
               <ul>
                  <li>
                     <details>
                        <summary><strong>📁 [id]/</strong></summary>
                        <ul>
                           <li>edit.js – Edit task page</li>
                           <li>users.js – Assign users to task</li>
                        </ul>
                     </details>
                  </li>
                  <li>index.js – Tasks list page</li>
                  <li>new.js – Create task page</li>
               </ul>
            </details>
         </li>
         <li>
            <details>
               <summary><strong>📁 users/</strong></summary>
               <ul>
                  <li>
                     <details>
                        <summary><strong>📁 [id]/</strong></summary>
                        <ul>
                           <li>edit.js – Edit user page</li>
                           <li>tasks.js – View user's tasks</li>
                        </ul>
                     </details>
                  </li>
                  <li>index.js – Users list page</li>
               </ul>
            </details>
         </li>
         <li>
            <details>
               <summary><strong>📁 profile/</strong></summary>
               <ul>
                  <li>index.js – User profile page</li>
               </ul>
            </details>
         </li>
         <li>_app.js – Custom App component</li>
         <li>_document.js – Custom Document</li>
         <li>index.js – Home page</li>
      </ul>
   </details>
   <details>
      <summary><strong>📁 public/</strong> – Static assets</summary>
   </details>
   <details>
      <summary><strong>📁 scripts/</strong></summary>
      <ul>
         <li>seed.js – DB seeding script</li>
      </ul>
   </details>
   <details>
      <summary><strong>📁 styles/</strong></summary>
      <ul>
         <li>globals.css – Global Tailwind styles</li>
      </ul>
   </details>
   <ul>
      <li>eslint.config.mjs – ESLint configuration</li>
      <li>jsconfig.json – Path aliases</li>
      <li>next.config.mjs – Next.js configuration</li>
      <li>package.json</li>
      <li>postcss.config.js – PostCSS config for Tailwind</li>
      <li>tailwind.config.js – Tailwind configuration</li>
      <li>README.md</li>
   </ul>
</details>
<details>
  <summary class="cursor-pointer font-semibold text-lg">
   <h2>API Endpoints</h2>
  </summary>
  <details>
    <summary class="cursor-pointer font-semibold text-lg">
      <h3>Users Collection (/api/users)</h3>
    </summary>
    <ul>
      <li><b>GET</b>: Retrieve all users</li>
      <li><b>POST</b>: Create a new user</li>
    </ul>
  </details>
  <details>
    <summary class="cursor-pointer font-semibold text-lg">
      <h3>Individual User (/api/users/[id])</h3>
    </summary>
    <ul>
      <li><b>GET</b>: Retrieve a specific user</li>
      <li><b>PUT</b>: Update a specific user</li>
      <li><b>DELETE</b>: Delete a specific user</li>
    </ul>
  </details>
  <details>
    <summary class="cursor-pointer font-semibold text-lg">
      <h3>Tasks Collection (/api/tasks)</h3>
    </summary>
    <ul>
      <li><b>GET</b>: Retrieve all tasks</li>
      <li><b>POST</b>: Create a new task</li>
    </ul>
  </details>
  <details>
    <summary class="cursor-pointer font-semibold text-lg">
      <h3>Individual Task (/api/tasks/[id])</h3>
    </summary>
    <ul>
      <li><b>GET</b>: Retrieve a specific task</li>
      <li><b>PUT</b>: Update a specific task</li>
      <li><b>DELETE</b>: Delete a specific task</li>
    </ul>
  </details>
  <details>
    <summary class="cursor-pointer font-semibold text-lg">
      <h3>Task Users (/api/tasks/[id]/users)</h3>
    </summary>
    <ul>
      <li><b>GET</b>: List users assigned to a task</li>
      <li><b>POST</b>: Assign a user to a task</li>
      <li><b>DELETE</b>: Remove a user from a task</li>
    </ul>
  </details>
  <details>
    <summary class="cursor-pointer font-semibold text-lg">
      <h3>Authentication (/api/auth)</h3>
    </summary>
    <ul>
      <li><b>POST</b> <code>/auth/signup</code>: Register new user</li>
      <li><code>[...nextauth].js</code>: NextAuth handler for login/session</li>
    </ul>
  </details>
</details>
<details>
  <summary class="cursor-pointer font-semibold text-lg">
   <h2>Data Storage</h2>
  </summary>
  <ul>
    <li><b>Connection pooling</b> via pg.Pool (lib/db.js)</li>
    <li><b>Prepared statements</b> for security and performance</li>
    <li><b>Transaction support</b> for data integrity</li>
    <li><b>Automatic timestamps</b> for created_at and updated_at</li>
    <li><b>Email uniqueness</b> constraint</li>
  </ul>
</details>
<details>
  <summary class="cursor-pointer font-semibold text-lg">
    <h2>Development</h2>
  </summary>
  <details>
    <summary class="cursor-pointer font-semibold text-lg">
      <h3>Adding New Fields</h3>
    </summary>
    <ol>
      <li>Update schema (via migration or in <code>scripts/seed.js</code>)</li>
      <li>Update methods in <code>lib/dataService.js</code></li>
      <li>Update forms in <code>components/UserForm.js</code>, <code>components/TasksForm/</code></li>
      <li>Update API routes in <code>pages/api/...</code></li>
      <li>Update display components</li>
    </ol>
  </details>
  <details>
    <summary class="cursor-pointer font-semibold text-lg">
      <h3>Database Migrations</h3>
    </summary>
    <ol>
      <li>Create migration files in <code>migrations/</code></li>
      <li>Use tools like <code>node-pg-migrate</code> or <code>knex.js</code></li>
      <li>Run migrations during deployment</li>
    </ol>
  </details>
  <details>
    <summary class="cursor-pointer font-semibold text-lg">
      <h3>Performance Optimization</h3>
    </summary>
    <ul>
      <li>Use connection pooling</li>
      <li>Add indexes</li>
      <li>Implement caching</li>
      <li>Use pagination for large datasets</li>
    </ul>
  </details>
  <details>
    <summary class="cursor-pointer font-semibold text-lg">
      <h3>Security Considerations</h3>
    </summary>
    <ul>
      <li>Use env vars for DB credentials</li>
      <li>Prepared statements to prevent SQL injection</li>
      <li>Input validation in API routes</li>
      <li>Email uniqueness enforced at DB level</li>
    </ul>
  </details>
</details>
<details>
  <summary class="cursor-pointer font-semibold text-lg">
    <h2>Production Deployment</h2>
  </summary>
  <details>
    <summary class="cursor-pointer font-semibold text-lg">
      <h3>Database Setup</h3>
    </summary>
    <ol>
      <li>Set up PostgreSQL (AWS RDS, Supabase, etc.)</li>
      <li>Run schema creation script</li>
      <li>Set required env vars:
        <pre><code>DATABASE_URL=postgresql://username:password@host:port/database_name
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production</code></pre>
      </li>
    </ol>
  </details>
  <details>
    <summary class="cursor-pointer font-semibold text-lg">
      <h3>Deployment Platforms</h3>
    </summary>
    <ul>
      <li>Vercel (recommended for Next.js)</li>
      <li>Netlify</li>
      <li>AWS</li>
      <li>Heroku</li>
      <li>Any Node.js hosting</li>
    </ul>
  </details>
</details>
<details>
  <summary class="cursor-pointer font-semibold text-lg">
    <h2>Troubleshooting</h2>
  </summary>
  <details>
    <summary class="cursor-pointer font-semibold text-lg">
      <h3>Common Issues</h3>
    </summary>
    <ul>
      <li>Database connection errors → check URL & PostgreSQL status</li>
      <li>Schema errors → verify schema created properly</li>
      <li>Env issues → ensure <code>.env.local</code> exists, restart dev server</li>
    </ul>
  </details>
  <details>
    <summary class="cursor-pointer font-semibold text-lg">
      <h3>Development Tips</h3>
    </summary>
    <ul>
      <li>Check browser network tab</li>
      <li>Use PostgreSQL logs</li>
      <li>Try pgAdmin or GUI for DB</li>
    </ul>
  </details>
</details>
<details>
  <summary class="cursor-pointer font-semibold text-lg">
    <h2>Learn More</h2>
  </summary>
  <ul>
    <li><a href="https://nextjs.org/docs">Next.js Documentation</a></li>
    <li><a href="https://nextjs.org/learn-pages-router">Learn Next.js</a></li>
    <li><a href="https://github.com/vercel/next.js">Next.js GitHub Repository</a></li>
  </ul>
</details>
<details>
  <summary class="cursor-pointer font-semibold text-lg">
    <h2>License</h2>
  </summary>
  <p>This project is open source and available under the <a href="LICENSE">MIT License</a>.</p>
</details>