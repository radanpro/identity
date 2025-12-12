import PropTypes from "prop-types";

const CameraView = ({ videoRef, canvasRef, flash, loading }) => {
  return (
    <div className="relative p-5 border border-gray-300 rounded-lg shadow-md mt-4">
      <video ref={videoRef} width="640" height="480" autoPlay />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-none z-10 w-40 h-40"
      />

      {flash && (
        <div className="absolute top-0 left-0 w-full h-full bg-white opacity-50 z-20"></div>
      )}

      {loading && <p className="text-lg">جاري التحميل...</p>}
    </div>
  );
};

CameraView.propTypes = {
  videoRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]).isRequired,
  canvasRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]).isRequired,
  flash: PropTypes.bool,
  loading: PropTypes.bool,
};

export default CameraView;
