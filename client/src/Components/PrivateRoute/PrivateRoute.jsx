import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const location = useLocation();

  const currentUser = useSelector((state) => state.user?.currentUser);

  const token =
    currentUser?.token ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  if (!token) {
    const redirectPath = location.pathname + location.search;

    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
        replace
      />
    );
  }

  return children ? children : <Outlet />;
}