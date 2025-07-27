import {BrowserRouter as Router, Route, Routes, useLocation} from 'react-router-dom';
import Header from './components/Header';
import Login from './components/Login';
import Profile from './components/Profile';
import Courses from "./components/Courses.jsx";
import Modules from "./components/Modules.jsx";
import Course from "./components/Course.jsx";
import Lesson from "./components/Lesson.jsx";
import PrEditor from "./components/PracticalEditor.jsx";
import PracticalEditor from "./components/PracticalEditor.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Register from "./components/Register.jsx";
import CreateCourse from "./components/CreateCourse.jsx";
import GroupsPage from "./components/GroupsPage.jsx";
import Groups from "./components/GroupsPage.jsx";
import GroupDetails from "./components/GroupDetails.jsx";
import React from "react";
import TestEditor from "./components/TestEditor.jsx";
import UserProgress from "./components/UserProgress.jsx";
import NotificationsPage from "./components/NotificationPage.jsx";

function App() {
    const location = useLocation();
    const showHeader = location.pathname !== '/login';
    const showSidebar = !location.pathname.startsWith('/login') && !location.pathname.startsWith('/lesson/');
    const userRole = 'admin'; // Предположим, что роль хранится в контексте или localStorage

    return (
        <div className="app-container">
            {showHeader && <Header/>}
            <div className="main-content">
                {showSidebar && <Sidebar />}
                <div className={showSidebar ? 'content-with-sidebar' : 'content-full'}>
                    <Routes>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/profile" element={<Profile/>}/>
                        <Route path="/courses" element={<Courses/>}/>
                        <Route path="/courses/create-course" element={<CreateCourse />} />
                        <Route path="/groups" element={<Groups/>}/>
                        <Route path="/group/:groupId" element={<GroupDetails/>}/>
                        <Route path="/course/:courseId" element={<Course/>}/>
                        <Route path="/courses/:courseName/Modules" element={<Modules/>}/>
                        <Route path="/lesson/:lessonId" element={<Lesson/>}/>
                        <Route path="/lesson/:lessonId/testEditor" element={<TestEditor/>}/>
                        <Route path="/pr-task/:prTaskId" element={<PracticalEditor/>}/>
                        <Route path="/user-progress" element={<UserProgress />} />
                        <Route path="/notifications/:userId" element={<NotificationsPage />} />
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/" element={<Login/>}/>
                    </Routes>
                </div>
            </div>
        </div>
    );
}

export default function AppWrapper() {
    return (
        <Router>
            <App/>
        </Router>
    );
}
