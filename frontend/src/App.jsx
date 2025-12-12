import { Route, Routes } from "react-router-dom";
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
import NewMonitoring from "./components/Monitoring/Monitoring";
import DevicePage from "./DevicesAndUsers/DevicePage";
import Register from "./login/Register";
import Profile from "./DevicesAndUsers/Profile";
import DeviceUpdate from "./DevicesAndUsers/DeviceUpdate";
import DeviceList from "./DevicesAndUsers/DeviceList";
import CaptureInterface from "./components/CaptureInterface";
import ExamList from "./exam/ExamList";
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
import NewExamList from "./exam/NewExamList";
import NewExamForm from "./exam/NewExamForm";
import AlertForm from "./Alert/AlertForm";
import AlertTypeList from "./Alert/AlertTypeList";
import AlertTypeForm from "./Alert/AlertTypeForm";
import AddDevice from "./DevicesAndUsers/AddDevice";
import CheatingDashboard from "./dashboard/CheatingDashboard";
import ExamDistributionForm from "./exam/ExamDistributionForm";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { validateDeviceToken, isUserLoggedIn } from "./utils/auth";

import {
  NotRequireDeviceRegister,
  RequireDeviceRegister,
} from "./components/RequireDeviceRegister";
import RequireUserLogin from "./components/RequireUserLogin";
import UserLogout from "./DevicesAndUsers/UserLogout";
import IdentityVerificationComponent from "./monitoring/IdentityVerificationComponent";
import EditVector from "./vectors/components/EditVector";
import IdentityVerificationPage from "./monitoring/IdentityVerificationPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegisterIn, setIsRegisterIn] = useState(false);

  const location = useLocation();
  // console.log("Current path:", location.pathname);
  useEffect(() => {
    async function checkAuth() {
      const deviceValid = await validateDeviceToken();
      const userLogged = isUserLoggedIn();
      setIsLoggedIn(userLogged);
      setIsRegisterIn(deviceValid);
    }

    checkAuth();
  }, [location.pathname]);

  // console.log(isRegisterIn);
  // const isLoggedIn = !!localStorage.getItem("token");
  return (
    // <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <div className="App">
      <div className="p-4 rounded-sm shadow-lg">
        <Routes>
          <Route path="/users" element={<MainLayout />}>
            <Route path="login" element={<Login />} />
            <Route
              path="register"
              element={
                <NotRequireDeviceRegister>
                  <Register />
                </NotRequireDeviceRegister>
              }
            />
            <Route path="/users/logout" element={<UserLogout />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="/" element={<Layout />}>
            <Route
              path="new-dashboard"
              index
              element={
                <RequireDeviceRegister>
                  <RequireUserLogin>
                    <Dashboard
                      isLoggedIn={isLoggedIn}
                      isRegisterIn={isRegisterIn}
                    />
                  </RequireUserLogin>
                </RequireDeviceRegister>
              }
            />
            <Route
              path="dashboard"
              index
              element={
                <RequireDeviceRegister>
                  <RequireUserLogin>
                    <CheatingDashboard
                      isLoggedIn={isLoggedIn}
                      isRegisterIn={isRegisterIn}
                    />
                  </RequireUserLogin>
                </RequireDeviceRegister>
              }
            />
            <Route
              path="add-student"
              element={
                <AddStudent
                  isLoggedIn={isLoggedIn}
                  isRegisterIn={isRegisterIn}
                />
              }
            />
            <Route
              path="edit-student/:id"
              element={
                <EditStudent
                  isLoggedIn={isLoggedIn}
                  isRegisterIn={isRegisterIn}
                />
              }
            />
            <Route
              path="students"
              element={
                <StudentList
                  isLoggedIn={isLoggedIn}
                  isRegisterIn={isRegisterIn}
                />
              }
            />
            <Route
              path="compare-image"
              element={
                <CompareImage
                  isLoggedIn={isLoggedIn}
                  isRegisterIn={isRegisterIn}
                />
              }
            />
            <Route
              index
              element={
                <CaptureInterface
                  setCapturedImage={() => {}}
                  isLoggedIn={isLoggedIn}
                  isRegisterIn={isRegisterIn}
                />
              }
            />
            <Route
              path="search-image"
              element={
                <SearchImage
                  isLoggedIn={isLoggedIn}
                  isRegisterIn={isRegisterIn}
                />
              }
            />
            <Route
              path="identity-verification"
              element={
                <IdentityVerificationComponent
                  isLoggedIn={isLoggedIn}
                  isRegisterIn={isRegisterIn}
                />
              }
            />
            <Route
              path="/enter-exam"
              element={
                <IdentityVerificationPage
                  isLoggedIn={isLoggedIn}
                  isRegisterIn={isRegisterIn}
                />
              }
            />
            <Route
              path="vectors"
              element={
                <VectorsList
                  isLoggedIn={isLoggedIn}
                  isRegisterIn={isRegisterIn}
                />
              }
            />
            <Route
              path="vectors/edit-vector"
              element={
                <EditVector
                  isLoggedIn={isLoggedIn}
                  isRegisterIn={isRegisterIn}
                />
              }
            />

            <Route
              path="add-vector"
              element={
                <AddVector
                  isLoggedIn={isLoggedIn}
                  isRegisterIn={isRegisterIn}
                />
              }
            />
            {/* model Alerts */}
            <Route path="alerts">
              <Route
                path="alert-list"
                element={
                  <AlertList
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="add-alert"
                element={
                  <AlertForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
            </Route>
            {/* AlertyType */}
            <Route path="alertsType">
              <Route
                path="alert-list"
                element={
                  <AlertTypeList
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="add-alert"
                element={
                  <AlertTypeForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="update-alert/:typeId"
                element={
                  <AlertTypeForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
            </Route>
            <Route
              path="models-list"
              element={
                <ModelList
                  isLoggedIn={isLoggedIn}
                  isRegisterIn={isRegisterIn}
                />
              }
            />
            <Route
              path="control-model"
              element={
                <ControlModel
                  isLoggedIn={isLoggedIn}
                  isRegisterIn={isRegisterIn}
                />
              }
            />
            <Route
              path="monitoring-model"
              element={
                <Monitoring
                  isLoggedIn={isLoggedIn}
                  isRegisterIn={isRegisterIn}
                />
              }
            />
            <Route
              path="monitoring"
              element={
                <NewMonitoring
                  isLoggedIn={isLoggedIn}
                  isRegisterIn={isRegisterIn}
                />
              }
            />
            {/* devices and users */}
            <Route path="devices">
              <Route
                path="register"
                element={
                  <DevicePage
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="add"
                element={
                  <AddDevice
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="update/:id"
                element={
                  <DeviceUpdate
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                index
                path="index"
                element={
                  <DeviceList
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
            </Route>
            {/* Exam */}
            <Route path="/exam">
              <Route
                path="distributions/:examId"
                element={
                  <ExamList
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="add-exam-distributions/:examId"
                element={
                  <ExamDistributionForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="edit-exam/:examId"
                element={
                  <ExamDistributionForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
            </Route>
            {/* NewExam */}
            <Route path="newexam">
              <Route
                path="index"
                element={
                  <NewExamList
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="add"
                element={
                  <NewExamForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="edit-exam/:examId"
                element={
                  <NewExamForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
            </Route>
            {/* College */}
            <Route path="college">
              <Route
                path="index"
                element={
                  <CollegeList
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="add"
                element={
                  <CollegeForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="edit-college/:collegeId"
                element={
                  <CollegeForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
            </Route>
            {/* academic */}
            <Route path="academic/majors">
              <Route
                path="college/:college_id"
                element={
                  <MajorList
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="add-major/:college_id"
                element={
                  <MajorForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="college/:college_id/edit-major/:major_id"
                element={
                  <MajorForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
            </Route>
            {/* Centers */}
            <Route path="centers">
              <Route
                path="index"
                element={
                  <CentersList
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="add"
                element={
                  <CenterForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="edit-center/:centerId"
                element={
                  <CenterForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
            </Route>
            {/* users */}
            <Route path="users">
              <Route
                path="index"
                element={
                  <UsersList
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="add"
                element={
                  <UserForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="edit-users/:userId"
                element={
                  <UserForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
            </Route>
            {/* Courses */}
            <Route path="courses">
              <Route
                path="index"
                element={
                  <CoursesList
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="add"
                element={
                  <CourseForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="edit-course/:course_id"
                element={
                  <CourseForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
            </Route>
            {/* Livels */}
            <Route path="levels">
              <Route
                path="index"
                element={
                  <LevelList
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="add"
                element={
                  <LevelForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="edit-level/:levelId"
                element={
                  <LevelForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
            </Route>
            {/* semesters */}
            <Route path="semesters">
              <Route
                path="index"
                element={
                  <SemesterList
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="add"
                element={
                  <SemesterForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="edit-semester/:semesterId"
                element={
                  <SemesterForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
            </Route>
            {/* years */}
            <Route path="years">
              <Route
                path="index"
                element={
                  <YearList
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="add"
                element={
                  <YearForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
              <Route
                path="edit-year/:yearId"
                element={
                  <YearForm
                    isLoggedIn={isLoggedIn}
                    isRegisterIn={isRegisterIn}
                  />
                }
              />
            </Route>
          </Route>
        </Routes>
      </div>
    </div>
    // </Router>
  );
}

export default App;
