import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import SuccessStoriesPage from './pages/SuccessStoriesPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/success-stories" element={<SuccessStoriesPage />} />
      </Routes>
    </Router>
  );
}