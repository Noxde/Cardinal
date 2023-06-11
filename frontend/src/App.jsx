import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import NotFound from "./components/NotFound";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
// import PrivateRoutes from "./utils/PrivateRoutes";
import ConfirmedEmail from "./components/ConfirmedEmail";
import { QueryClient, QueryClientProvider } from "react-query";
import Layout from "./components/Layout";

import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="*" element={<NotFound />} />
            <Route path="/confirmed-email/:user" element={<ConfirmedEmail />} />
            <Route path="/register" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route
                path="/profile/"
                element={<Profile key={"userProfile"} />}
              />
              <Route
                path="/profile/:username"
                element={<Profile key={window.location.pathname} />}
              />
            </Route>
          </Routes>
          {/* <Route element={<PrivateRoutes />}></Route> */}
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
