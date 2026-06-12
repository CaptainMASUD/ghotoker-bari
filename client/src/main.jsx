import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Layout from './Components/Layout/Layout';
import Home from './Components/Home/Home';
import { Provider } from 'react-redux';  
import { PersistGate } from 'redux-persist/integration/react';  
import { store, persistor } from './Redux/Store/Store';  
import PrivateRoute from './Components/PrivateRoute/PrivateRoute';
import RegistrationForm from './Components/SingUP/SignUP';
import LoginForm from './Components/SingIn/SignIN';
import PremiumMembershipDashboard from './Components/Membership/Membership';
import FindMatches from './Components/FindMatches/FindMatches';
import SuccessStories from './Components/SuccessStories/SuccessStories';
import ContactPage from './Components/Contact/ContactPage';
import PremiumChatUI from './Components/Chat/Chat';
import UserDashboard from './Components/UserPanel/UsersDashbaord';
import ForgotPassword from './Components/ForgetPassword/ForgotPassword';
import PrivacyPolicy from './Components/Policies/PrivacyPolicy';
import TermsAndConditions from './Components/Policies/TermsAndConditions';
import AdminRegister from './Components/SingUP/AdminRegister';
import AdminDashboard from './Components/Dashboard/Dashboard';
import SubscriptionPlans from './Components/SubscriptionPlans/SubscriptionPlans';




// Define your routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,  
    children: [
      { path: '', element: <Home /> },
      { path: 'register', element: <RegistrationForm /> },
      { path: 'login', element: <LoginForm /> },
      { path: 'admin/dashboard', element: < AdminDashboard/> },
      { path: 'membership', element: <PremiumMembershipDashboard /> },
      { path: 'find-matches', element: <FindMatches /> },
      { path: 'success-stories', element: <SuccessStories /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'admin-register', element: <AdminRegister /> },
      { path: 'chat', element: <PremiumChatUI /> },
      { path: 'profile', element: < UserDashboard/> },
      { path: 'forgot-password', element: < ForgotPassword/> },
      { path: 'privacy-policy', element: < PrivacyPolicy/> },
      { path: 'terms-conditions', element: < TermsAndConditions/> },
      { path: 'plans', element: < SubscriptionPlans/> },
     
      
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </StrictMode>
);
