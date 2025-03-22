import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AddStudent from "./students/AddStudent";
import StudentList from "./students/StudentList";
import VectorsList from "./vectors/VectorList";
import CompareImage from "./components/CompareImage";
import SearchImage from "./components/SearchImage";
import SearchRealTime from "./components/SearchRealTime";
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

function App() {
  return (
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <div className="App">
        <div className="p-4 rounded-sm shadow-lg">
          <Routes>
            <Route path="/users" element={<MainLayout />}>
              <Route path="login" element={<Login />} />
              {/* <Route path="register" element={<Register />} /> */}
            </Route>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="add-student" element={<AddStudent />} />
              <Route path="edit-student/:id" element={<EditStudent />} />
              <Route path="students" element={<StudentList />} />
              <Route path="compare-image" element={<CompareImage />} />
              <Route
                path="camera"
                element={<SearchRealTime setCapturedImage={() => {}} />}
              />
              <Route path="search-image" element={<SearchImage />} />
              <Route path="vectors" element={<VectorsList />} />
              <Route path="add-vector" element={<AddVector />} />
              {/* model */}
              <Route path="/alert-list" element={<AlertList />} />
              <Route path="/models-list" element={<ModelList />} />
              <Route path="/control-model" element={<ControlModel />} />
              <Route path="/monitoring-model" element={<Monitoring />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
