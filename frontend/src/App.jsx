import { Route, Routes } from 'react-router';
import Layout from './components/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import { layoutRoutes, standaloneRoutes } from './routes.js';

// Ortak dosya: yeni sayfa eklemek için buraya dokunmayın,
// src/pages altına dosya açmanız yeterli (bkz. src/routes.js).
export default function App() {
  return (
    <Routes>
      {standaloneRoutes.map(({ path, Component }) => (
        <Route key={path} path={path} element={<Component />} />
      ))}

      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        {layoutRoutes.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Route>
    </Routes>
  );
}
