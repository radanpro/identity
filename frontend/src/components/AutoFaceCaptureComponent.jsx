import { useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import useAutoFaceCapture from "../hooks/useAutoFaceCapture";
import SearchResults from "./SearchResults";

const AutoFaceCaptureComponent = ({ threshold, limit }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCapture = async (imageData) => {
    setCapturedImage(imageData);
    try {
      const blob = await (await fetch(imageData)).blob();
      const formData = new FormData();
      formData.append("image", blob, "image.jpg");
      formData.append("threshold", threshold);
      formData.append("limit", limit);

      const response = await axios.post(
        "http://127.0.0.1:3000/vectors/vectors/search",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 200 && response.data.results) {
        // console.log(response.data.results);
        setResult(response.data.results);
      } else {
        setError(response.data.message || "لم يتم العثور على نتائج.");
      }
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء معالجة الصورة.");
    }
  };

  const { videoRef, canvasRef, overlayRef, startCamera } = useAutoFaceCapture(
    handleCapture,
    5000
  ); // 5 ثواني

  const retryDetection = () => {
    setCapturedImage(null);
    setResult(null);
    setError(null);
    startCamera();
  };

  return (
    <div className="p-4 border rounded shadow-sm">
      <h3 className="text-xl font-bold mb-2 text-center">
        التقاط تلقائي عند التعرف على الوجه
      </h3>
      {!capturedImage && (
        <div className="relative w-full max-w-lg mx-auto">
          <video ref={videoRef} autoPlay className="w-full border rounded" />
          <canvas
            ref={overlayRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      )}
      {capturedImage && (
        <div className="mt-4 flex flex-col items-center">
          <h4 className="font-bold">الصورة الملتقطة:</h4>
          <img
            src={capturedImage}
            alt="الصورة الملتقطة"
            className="mt-2 w-full max-w-md rounded shadow"
          />
        </div>
      )}
      {capturedImage && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={retryDetection}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          >
            إعادة التعرف
          </button>
        </div>
      )}
      {result && (
        <SearchResults
          imageResults={{ results: result }}
          errorMessage={error}
        />
      )}
      {error && <div className="mt-2 text-red-500 text-center">{error}</div>}
    </div>
  );
};

AutoFaceCaptureComponent.propTypes = {
  threshold: PropTypes.number.isRequired,
  limit: PropTypes.number,
};

export default AutoFaceCaptureComponent;
