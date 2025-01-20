import PropTypes from "prop-types";

const CameraControls = ({
  cameraActive,
  startCamera,
  stopCamera,
  captureImage,
}) => {
  return (
    <div className="mt-4  text-center">
      {!cameraActive ? (
        <button
          onClick={startCamera}
          className="p-2 px-6 bg-green-500 text-white rounded text-base"
        >
          فتح الكاميرا
        </button>
      ) : (
        <>
          <button
            onClick={stopCamera}
            className="p-2 bg-red-500 text-white rounded ml-4"
          >
            إغلاق الكاميرا
          </button>
          <button
            onClick={captureImage}
            className="p-2 bg-blue-500 text-white rounded ml-4"
          >
            التقاط صورة
          </button>
        </>
      )}
    </div>
  );
};
CameraControls.propTypes = {
  cameraActive: PropTypes.bool.isRequired,
  startCamera: PropTypes.func.isRequired,
  stopCamera: PropTypes.func.isRequired,
  captureImage: PropTypes.func.isRequired,
};

export default CameraControls;
