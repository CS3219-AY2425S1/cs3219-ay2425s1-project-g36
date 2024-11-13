# PeerPrep Frontend - Developer Readme (for now)

## Important commands

The frontend is a **React + TypeScript** project using **Vite**. Note that `yarn` is used as the Node.js package manager here.

### Quick start

This application requires Node.js and the `yarn` package manager to be installed.

The Node.js installation can be done [here](https://nodejs.org/en).

The `yarn` package manager can be installed using the following terminal command once Node.js is installed:

```
npm install --global yarn
```

With `yarn` installed, you can run these two commands from the `./frontend` folder to get the frontend up and running quickly:

1. `yarn` (installs all required dependencies used by this frontend)
2. `yarn dev` (to run the application)

### Running the application: `yarn dev`

This command runs the application on port 5173. Run this command and visit http://localhost:5173 on your web browser to view the application.

When running the application in the development environment, you can also edit the source React TSX files and view the changes instantaneously on your web browser.

#### Application paths you can try

- `http://localhost:5173/` - main page if logged in, redirect to login page if not
- `http://localhost:5173/login` - login page if not logged in
- `http://localhost:5173/signup` - signup page if not logged in
- `http://localhost:5173/forgot-password` - forgot password page if not logged in
- `http://localhost:5173/settings` - user account settings if logged in
- `http://localhost:5173/questions` - question list if logged in
- `http://localhost:5173/questions/new` - form to add questions if admin, else redirects to list questions page
- `http://localhost:5173/questions/1` - view question 1 if not admin, edit question 1 if admin, login page if not logged in
- `http://localhost:5173/nonsense-link` - error page

### Adding dependencies: `yarn add PACKAGE_NAME`

To add an NPM dependency to this application, use the `yarn add` command to add the specific desired `npm` package.

For more Yarn commands and their equivalents in terms of the `npm` command, you may refer to this cheatsheet [here](https://shift.infinite.red/npm-vs-yarn-cheat-sheet-8755b092e5cc).

## Editing the frontend

This application uses **React Router v6**. All the individual pages within this application are located within the `/pages` folder and routed based on path in `App.tsx`. You may refer to the [Figma UI outline](https://www.figma.com/design/RnzGRTLoieWlvUJoHLH6eE) to take a look at what the pages are supposed to look like.

### Adding a route to a page
You may add a route by adding a &lt;Route /&gt; tag within the &lt;Routes&gt;&lt;/Routes&gt; section within `App.tsx`. Here are some example routes (depending on context), where **PageA** and **PageB** refer to page components already implemented in `/pages`:

- Public and private route: 
  ```tsx
  <Route path="/link/to/path/:param" element={
    <PageA />
  } />
  ```

  or

  ```tsx
  <Route path="/link/to/path/:param" Component={ PageA } />
  ```
- Private route (for logged-in users only):
  ```tsx
  <Route path="/link/to/path/:param" element={
    <PrivateRoute>
      <PageA />
    </PrivateRoute>
  } />
  ```
- Public route (for non-logged-in users only):
  ```tsx
  <Route path="/link/to/path/:param" element={
    <PublicRoute>
      <PageB />
    </PublicRoute>
  } />
  ```
- Admin-only route:
  ```tsx
  // render two separate pages
  <Route path="/questions/:id" element={
    <AdminRoute
      adminRoute={ <EditQuestionPage /> }
      nonAdminRoute={ <ViewQuestionPage /> }
    />
  } />
  ```
  or
  ```tsx
  // redirects users to ./questions if not admin
  <Route path="/questions/new" element={
    <AdminRoute
      adminRoute={ <AddQuestionPage /> }
      nonAdminRoute={ <Navigate to="/questions" /> }
    />
  } />
  ```

### Accessing parameters in a route URL
```tsx
<Route path="/link/to/path/:something" Component={ PageA } />
```

You can use React Router's `useParams()` hook to get the URL parameters. For example, `/link/to/path/1` causes the `something` parameter above to have the value `1`. If `PageA` component is implemented in a `PageA.tsx` file, you may implement it as follows:

```tsx
import { useParams } from 'react-router-dom';

export default function PageA() {
  const params = useParams();

  const something = params.something;

  return (
    <>Page A with something param value {something}</>
  )
}
```

### Page Header (for Question Service and Matching Service Pages)
When you start designing a question service and matching service page, add the header using the following format:

```tsx
export default function PageA() {
  return (
    <>
      <PageHeader />
      <div className="container mx-auto py-10">
        { /* your other stuff... */ }
      </div>
    </>
  );
}
```

This is not required for pages related to the User Service.

### Difficulty view/topic view (for Question Service pages)
You may add a formatted difficulty view that has the relevant colour using the `Difficulty` component:

```tsx
// difficulty type can be "easy", "medium", or "hard"
return (
  <p>
    <Difficulty type="easy" />
  </p>
);
```

You may also add a view containing all topics using the `TopicView` component:
```tsx
const topics = ['DP', 'binary search', 'graph theory'];

return (
  <section>
    <h3>Topics</h3>
    <p>
      <TopicView topics={ topics } />
    </p>
  </section>
);
```

### Using the Authentication Context to access User Information
In order to detect whether a user is logged in, an admin, as well as the currently logged-in user's details, we use the Authentication Context (`./contexts/AuthContext.tsx`). In order to ensure authentication context stays between page refreshes, it is loaded and saved into `localStorage` as and when it is updated.

In your page, you can access the following: `auth`, `login`, `logout`:
- `auth`: The current login information, consisting of a JavaScript object with two boolean values: `isLoggedIn` and `isAdmin` (for now).
- `login(isAdmin : boolean)`: The login function. Takes in the parameter `isAdmin` to detect whether the user wants to log in as an admin or not.
- `logout()`: The logout function.

**Example usage:**
```tsx
const { auth, login, logout } = useAuth();

const loginAsAdminBtnClick = () => {
  login(true); // Log in as admin
  const adminStatus = auth.isAdmin ? "Yes" : "No";
  alert("Logged in as admin? " + adminStatus);
}

const logoutBtnClick = () => { logout(); }
```