import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import NotFound from "./components/NotFound";
import Home from "./components/Home";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import PrivateRoutes from "./utils/PrivateRoutes";

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<PrivateRoutes />}>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<Login />} />
          </Route>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
