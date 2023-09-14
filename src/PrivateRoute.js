import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function PrivateRoute({ isLogged, element }) {
  // If the user is not logged in, redirect to the login page
  return isLogged ? <Outlet /> : <Navigate to="/login" />;
}
export default PrivateRoute;
