import { useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import SearchResults from "./SearchResults";

const UploadImageComponent = ({ threshold, limit }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("threshold", threshold);
    formData.append("limit", limit);

    setError(null);
    setUploadResult(null);
    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:3000/vectors/vectors/search",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.status === 200 && response.data.results) {
        setUploadResult(response.data.results);
      } else {
        setError(response.data.message || "لم يتم العثور على نتائج.");
      }
    } catch (err) {
      setError("حدث خطأ أثناء رفع الصورة.", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow-sm">
      <h3 className="text-xl font-bold mb-2 text-center">رفع صورة من الجهاز</h3>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-gray-700"
      />
      <button
        onClick={handleUpload}
        className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        رفع الصورة
      </button>
      {loading && <p className="mt-2 text-center">جاري الرفع...</p>}
      {uploadResult && (
        <SearchResults
          imageResults={{ results: uploadResult }}
          errorMessage={error}
        />
      )}
      {error && <div className="mt-2 text-red-500 text-center">{error}</div>}
    </div>
  );
};

UploadImageComponent.propTypes = {
  threshold: PropTypes.number.isRequired,
  limit: PropTypes.number,
};

export default UploadImageComponent;
