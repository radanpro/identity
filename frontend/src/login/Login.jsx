import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });
      alert(response.data.message);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed, please try again.");
    }
  };

  return (
    <div className="flex  justify-center w-full h-screen bg-gray-50 p-8 pb-0">
      <div className="flex w-full m-4 mb-0 p-4 h-2/3 bg-inhirit rounded-lg shadow-lg overflow-hidden">
        {/* Left Section */}
        <div className="flex flex-col justify-center w-1/2 p-2 bg-inherit items-center rounded-md">
          <h1 className="text-4xl font-bold mb-4 text-blue-800">
            AI Exam Proctoring System
          </h1>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-1/2 p-8 bg-white rounded-md lg:m-8 shadow-md shadow-sky-200 ">
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-semibold text-center mb-6">Sign In</h2>
            <div>
              <label htmlFor="username" className="text-gray-400">
                username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="text-gray-400">
                password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-3 text-gray-500">Hide</span>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gray-600 text-white rounded-lg lg:mt-4 hover:bg-blue-400 transition-colors"
            >
              Log in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
