import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import Login from './pages/Login';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/success-stories" element={<SuccessStoriesPage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}