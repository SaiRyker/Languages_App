import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Profile from './components/Profile';
import Courses from "./components/Courses.jsx";
import Modules from "./components/Modules.jsx";
import Course from "./components/Course.jsx";
import Lesson from "./components/Lesson.jsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/course/:courseId" element={<Course />} />
                <Route path="/courses/:courseName/Modules" element={<Modules />} />
                <Route path="/lesson/:lessonId" element={<Lesson />} />
                <Route path="/" element={<Login />} />
            </Routes>
        </Router>
    );
}

export default App;
