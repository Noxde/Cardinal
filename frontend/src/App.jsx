import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import NotFound from "./components/NotFound";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import PrivateRoutes from "./utils/PrivateRoutes";
import { QueryClient, QueryClientProvider } from "react-query";

import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route element={<PrivateRoutes />}>
              <Route path="/register" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
            </Route>
            <Route path="/" element={<Home />} />
            <Route path="/profile/" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
