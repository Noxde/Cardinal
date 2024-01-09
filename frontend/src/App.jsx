import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import NotFound from "./pages/404/index";
import Home from "./pages/Home/index";
import Profile from "./pages/Profile/index";
import Login from "./pages/Login/index";
import SignUp from "./pages/SignUp/index";
// import PrivateRoutes from "./utils/PrivateRoutes";
import ConfirmedEmail from "./pages/ConfirmedEmail/index";
import { QueryClient, QueryClientProvider } from "react-query";
import Layout from "./components/Layout";

import { AuthProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocket";
import Chats from "./pages/Chats";

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
            <Route
              element={
                <WebSocketProvider>
                  <Layout />
                </WebSocketProvider>
              }
            >
              <Route path="/" element={<Home />} />
              <Route
                path="/profile/:username"
                element={<Profile key={window.location.pathname} />}
              />
              <Route
                path="/profile/"
                element={<Profile key={"userProfile"} />}
              />
              <Route path="/messages/" element={<Chats />} />
            </Route>
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
