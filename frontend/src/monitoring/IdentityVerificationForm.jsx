// src/components/Monitoring/IdentityVerificationForm.jsx
import PropTypes from "prop-types";

const IdentityVerificationForm = ({
  studentId,
  setStudentId,
  handleFileChange,
  loading,
  handleSubmit,
}) => {
  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="mb-4">
          <label
            htmlFor="studentId"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            رقم الطالب
          </label>
          <input
            type="text"
            id="studentId"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="mt-1 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="أدخل رقم الطالب"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="image"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            تحميل صورة الطالب (الوجه)
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 p-2 border border-gray-300 rounded-lg w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            required
          />
        </div>
      </div>

      <div className="mt-6 flex justify-center p-2">
        <button
          type="submit"
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed mx-2"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              جارٍ التحقق...
            </span>
          ) : (
            "التحقق من الهوية"
          )}
        </button>
      </div>
    </form>
  );
};

IdentityVerificationForm.propTypes = {
  studentId: PropTypes.string.isRequired,
  setStudentId: PropTypes.func.isRequired,
  handleFileChange: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

export default IdentityVerificationForm;
