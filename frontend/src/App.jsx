import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AddStudent from "./students/AddStudent";
import StudentList from "./students/StudentList";
import VectorsList from "./vectors/VectorList";
import CompareImage from "./components/CompareImage";
import SearchImage from "./components/SearchImage";
// import SearchRealTime from "./components/SearchRealTime";
import EditStudent from "./students/EditStudent";
import Layout from "./Layout";
import Dashboard from "./dashboard/Dashboard";
import AddVector from "./vectors/AddVector";
import Login from "./login/Login";
import MainLayout from "./root/MainLayout";
import AlertList from "./Alert/AlertList";
import ModelList from "./AIExapServer/Models/ModelsList";
import ControlModel from "./Models/admin/ControlModel";
import Monitoring from "./Models/Monitoring";
import DevicePage from "./DevicesAndUsers/DevicePage";
import Register from "./login/Register";
import Profile from "./DevicesAndUsers/Profile";
import DeviceUpdate from "./DevicesAndUsers/DeviceUpdate";
import DeviceList from "./DevicesAndUsers/DeviceList";
import CaptureInterface from "./components/CaptureInterface";
import ExamList from "./exam/ExamList";
import ExamForm from "./exam/AddExam";
import CollegeForm from "./Colleges/AddCollege";
import CollegeList from "./Colleges/CollegesList";
import CenterForm from "./Centers/AddCenter";
import CentersList from "./Centers/CentersList";
import UsersList from "./DevicesAndUsers/UsersList";
import UserForm from "./DevicesAndUsers/AddUser";
import CoursesList from "./Academic/Courses/CoursesList";
import CourseForm from "./Academic/Courses/CourseForm";
import LevelList from "./Academic/Levels/LevelList";
import LevelForm from "./Academic/Levels/LevelForm";
import SemesterList from "./Academic/Semesters/SemesterList";
import SemesterForm from "./Academic/Semesters/SemesterForm";
import YearList from "./Academic/Years/YearList";
import YearForm from "./Academic/Years/YearForm";
import MajorForm from "./Academic/Majors/MajorForm";
import MajorList from "./Academic/Majors/MajorList";

function App() {
  const isLoggedIn = true;
  // const isLoggedIn = !!localStorage.getItem("token");
  return (
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <div className="App">
        <div className="p-4 rounded-sm shadow-lg">
          <Routes>
            <Route path="/users" element={<MainLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard isLoggedIn={isLoggedIn} />} />
              <Route
                path="add-student"
                element={<AddStudent isLoggedIn={isLoggedIn} />}
              />
              <Route
                path="edit-student/:id"
                element={<EditStudent isLoggedIn={isLoggedIn} />}
              />
              <Route
                path="students"
                element={<StudentList isLoggedIn={isLoggedIn} />}
              />
              <Route
                path="compare-image"
                element={<CompareImage isLoggedIn={isLoggedIn} />}
              />
              <Route
                path="camera"
                element={
                  <CaptureInterface
                    setCapturedImage={() => {}}
                    isLoggedIn={isLoggedIn}
                  />
                }
              />
              <Route
                path="search-image"
                element={<SearchImage isLoggedIn={isLoggedIn} />}
              />
              <Route
                path="vectors"
                element={<VectorsList isLoggedIn={isLoggedIn} />}
              />
              <Route
                path="add-vector"
                element={<AddVector isLoggedIn={isLoggedIn} />}
              />
              {/* model */}
              <Route
                path="/alert-list"
                element={<AlertList isLoggedIn={isLoggedIn} />}
              />
              <Route
                path="/models-list"
                element={<ModelList isLoggedIn={isLoggedIn} />}
              />
              <Route
                path="/control-model"
                element={<ControlModel isLoggedIn={isLoggedIn} />}
              />
              <Route
                path="/monitoring-model"
                element={<Monitoring isLoggedIn={isLoggedIn} />}
              />
              {/* devices and users */}
              <Route path="/devices">
                <Route
                  path="register"
                  element={<DevicePage isLoggedIn={isLoggedIn} />}
                />
                <Route
                  path="update/:id"
                  element={<DeviceUpdate isLoggedIn={isLoggedIn} />}
                />
                <Route
                  index
                  path="index"
                  element={<DeviceList isLoggedIn={isLoggedIn} />}
                />
              </Route>
              {/* Exam */}
              <Route path="/exam">
                <Route
                  path="index"
                  element={<ExamList isLoggedIn={isLoggedIn} />}
                />
                <Route
                  path="add"
                  element={<ExamForm isLoggedIn={isLoggedIn} />}
                />
                <Route
                  path="edit-exam/:examId"
                  element={<ExamForm isLoggedIn={isLoggedIn} />}
                />
              </Route>
              {/* College */}
              <Route path="/college">
                <Route
                  path="index"
                  element={<CollegeList isLoggedIn={isLoggedIn} />}
                />
                <Route
                  path="add"
                  element={<CollegeForm isLoggedIn={isLoggedIn} />}
                />
                <Route
                  path="edit-college/:collegeId"
                  element={<CollegeForm isLoggedIn={isLoggedIn} />}
                />
              </Route>
              {/* academic */}
              <Route path="/academic/majors">
                <Route
                  path="college/:college_id"
                  element={<MajorList isLoggedIn={isLoggedIn} />}
                />
                <Route
                  path="add-major/:college_id"
                  element={<MajorForm isLoggedIn={isLoggedIn} />}
                />
                <Route
                  path="college/:college_id/edit-major/:major_id"
                  element={<MajorForm isLoggedIn={isLoggedIn} />}
                />
              </Route>
              {/* Centers */}
              <Route path="/centers">
                <Route
                  path="index"
                  element={<CentersList isLoggedIn={isLoggedIn} />}
                />
                <Route
                  path="add"
                  element={<CenterForm isLoggedIn={isLoggedIn} />}
                />
                <Route
                  path="edit-center/:centerId"
                  element={<CenterForm isLoggedIn={isLoggedIn} />}
                />
              </Route>
              {/* users */}
              <Route path="/users">
                <Route
                  path="index"
                  element={<UsersList isLoggedIn={isLoggedIn} />}
                />
                <Route
                  path="add"
                  element={<UserForm isLoggedIn={isLoggedIn} />}
                />
                <Route
                  path="edit-users/:userId"
                  element={<UserForm isLoggedIn={isLoggedIn} />}
                />
              </Route>
              {/* Courses */}
              <Route path="/courses">
                <Route
                  path="index"
                  element={<CoursesList isLoggedIn={isLoggedIn} />}
                />
                <Route
                  path="add"
                  element={<CourseForm isLoggedIn={isLoggedIn} />}
                />
                <Route
                  path="edit-course/:courseId"
                  element={<CourseForm isLoggedIn={isLoggedIn} />}
                />
              </Route>
              {/* Livels */}
              <Route path="/levels">
                <Route
                  path="index"
                  element={<LevelList isLoggedIn={isLoggedIn} />}
                />
                <Route
                  path="add"
                  element={<LevelForm isLoggedIn={isLoggedIn} />}
                />
                <Route
                  path="edit-level/:levelId"
                  element={<LevelForm isLoggedIn={isLoggedIn} />}
                />
              </Route>
              {/* semesters */}
              <Route path="/semesters">
                <Route
                  path="index"
                  element={<SemesterList isLoggedIn={isLoggedIn} />}
                />
                <Route
                  path="add"
                  element={<SemesterForm isLoggedIn={isLoggedIn} />}
                />
                <Route
                  path="edit-semester/:semesterId"
                  element={<SemesterForm isLoggedIn={isLoggedIn} />}
                />
              </Route>
              {/* years */}
              <Route path="/years">
                <Route
                  path="index"
                  element={<YearList isLoggedIn={isLoggedIn} />}
                />
                <Route
                  path="add"
                  element={<YearForm isLoggedIn={isLoggedIn} />}
                />
                <Route
                  path="edit-year/:yearId"
                  element={<YearForm isLoggedIn={isLoggedIn} />}
                />
              </Route>
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
