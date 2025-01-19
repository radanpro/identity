import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AddStudent from "./students/AddStudent";
import StudentList from "./students/StudentList";
import VectorsList from "./vectors/VectorList";
import CompareImage from "./components/CompareImage";
import SearchImage from "./components/SearchImage";
import SearchRealTime from "./components/SearchRealTime";
import Layout from "./Layout";
import Dashboard from "./dashboard/Dashboard";

function App() {
  return (
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <div className="App ">
        <div className="p-4 rounded-sm shadow-lg">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add-student" element={<AddStudent />} />
              <Route path="/students" element={<StudentList />} />
              <Route path="/compare-image" element={<CompareImage />} />
              <Route
                path="/camera"
                element={<SearchRealTime setCapturedImage={() => {}} />}
              />
              <Route path="/search-image" element={<SearchImage />} />
              <Route path="/vectors" element={<VectorsList />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
