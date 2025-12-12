import PropTypes from "prop-types";

const DeviceSelector = ({ devices, selectedDeviceId, setSelectedDeviceId }) => {
  return (
    <div className="mt-4 text-center justify-center items-center">
      <label htmlFor="camera-select" className="mr-2 text-lg">
        اختر الكاميرا:
      </label>
      <select
        id="camera-select"
        onChange={(e) => setSelectedDeviceId(e.target.value)}
        value={selectedDeviceId || ""}
        className="p-2 text-base border border-gray-300 rounded"
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Camera ${device.deviceId}`}
          </option>
        ))}
      </select>
    </div>
  );
};

DeviceSelector.propTypes = {
  devices: PropTypes.arrayOf(
    PropTypes.shape({
      deviceId: PropTypes.string.isRequired,
      label: PropTypes.string,
    })
  ).isRequired,
  selectedDeviceId: PropTypes.string,
  setSelectedDeviceId: PropTypes.func.isRequired,
};

export default DeviceSelector;
