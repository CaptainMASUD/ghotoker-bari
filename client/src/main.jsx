import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { jwtDecode } from "jwt-decode";

import { store, persistor } from "./Redux/Store/Store";
import { logout } from "./Redux/UserSlice/UserSlice"; 

import Layout from "./Components/Layout/Layout";
import PrivateRoute from "./Components/PrivateRoute/PrivateRoute";

import Home from "./Components/Home/Home";
import RegistrationForm from "./Components/SingUP/SignUP";
import AdminRegister from "./Components/SingUP/AdminRegister";
import LoginForm from "./Components/SingIn/SignIN";
import ForgotPassword from "./Components/ForgetPassword/ForgotPassword";

import PremiumMembershipDashboard from "./Components/Membership/Membership";
import SubscriptionPlans from "./Components/SubscriptionPlans/SubscriptionPlans";

import FindMatches from "./Components/FindMatches/FindMatches";
import ProfileDetails from "./Components/FindMatches/ProfileDetails";

import SuccessStories from "./Components/SuccessStories/SuccessStories";
import ContactPage from "./Components/Contact/ContactPage";
import PremiumChatUI from "./Components/Chat/Chat";

import UserDashboard from "./Components/UserPanel/UsersDashbaord";

import PrivacyPolicy from "./Components/Policies/PrivacyPolicy";
import TermsAndConditions from "./Components/Policies/TermsAndConditions";

import AdminDashboard from "./Components/Dashboard/Dashboard";

/* =====================================================
   AUTO LOGOUT WHEN TOKEN EXPIRED
===================================================== */

const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);

    if (!decoded?.exp) return true;

    const currentTime = Date.now() / 1000;

    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

const AuthChecker = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkToken = () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (token && isTokenExpired(token)) {
        dispatch(logout());
      }
    };

    // check immediately when app starts
    checkToken();

    // keep checking every 30 seconds
    const interval = setInterval(checkToken, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Home />,
      },

      {
        path: "register",
        element: <RegistrationForm />,
      },

      {
        path: "login",
        element: <LoginForm />,
      },

      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },

      {
        path: "admin-register",
        element: <AdminRegister />,
      },

      {
        path: "admin/dashboard",
        element: (
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        ),
      },

      {
        path: "membership",
        element: <PremiumMembershipDashboard />,
      },

      {
        path: "plans",
        element: <SubscriptionPlans />,
      },

      {
        path: "find-matches",
        element: <FindMatches />,
      },

      {
        path: "find-matches/:id",
        element: <ProfileDetails />,
      },

      {
        path: "success-stories",
        element: <SuccessStories />,
      },

      {
        path: "contact",
        element: <ContactPage />,
      },

      {
        path: "chat",
        element: (
          <PrivateRoute>
            <PremiumChatUI />
          </PrivateRoute>
        ),
      },

      {
        path: "profile",
        element: (
          <PrivateRoute>
            <UserDashboard />
          </PrivateRoute>
        ),
      },

      {
        path: "profile/:panel",
        element: (
          <PrivateRoute>
            <UserDashboard />
          </PrivateRoute>
        ),
      },

      {
        path: "privacy-policy",
        element: <PrivacyPolicy />,
      },

      {
        path: "terms-conditions",
        element: <TermsAndConditions />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <AuthChecker>
          <RouterProvider router={router} />
        </AuthChecker>
      </PersistGate>
    </Provider>
  </StrictMode>
);