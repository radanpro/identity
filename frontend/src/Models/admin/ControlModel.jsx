import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Header from "../../components/Header";
import PropTypes from "prop-types";

// Default configuration (same as the provided config)
const defaultConfig = {
  faceMeshOptions: {
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
  },
  poseOptions: {
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
  },
  camera: {
    width: 800,
    height: 600,
  },
  attentionDecrementFactor: 5,
  attentionIncrementFactor: 1,
  noFaceDecrementFactor: 3,
  alerts: {
    head: {
      upThreshold: -0.5,
      downThreshold: 0.5,
      lateralThreshold: 15,
      duration: 3000,
      enabled: {
        up: true,
        down: true,
        left: true,
        right: true,
        forward: true,
      },
    },
    mouth: {
      threshold: 0.05,
      duration: 3000,
      enabled: true,
    },
    gaze: {
      duration: 3000,
      enabled: true,
    },
    headPose: {
      neutralRange: 5,
      smoothingFrames: 10,
      referenceFrames: 30,
    },
  },
};

const EditConfig = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);

  // Fetch the current configuration from the backend when the component mounts
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/config");
        if (!response.ok) {
          throw new Error("Network error");
        }
        const backendConfig = await response.json();
        setConfig(backendConfig);
      } catch (error) {
        console.error("Error fetching config:", error);
        setConfig(defaultConfig);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Update a value in a given section of the config
  const handleInputChange = (section, key, value) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      [section]: {
        ...prevConfig[section],
        [key]: value,
      },
    }));
  };

  // Handle nested updates (for example, alerts.head.enabled)
  const handleNestedChange = (section, subSection, key, value) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      [section]: {
        ...prevConfig[section],
        [subSection]: {
          ...prevConfig[section][subSection],
          [key]: value,
        },
      },
    }));
  };

  // Handle form submission (save updated config to backend)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/config", {
        method: "POST", // or PUT, depending on your API design
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });
      if (!response.ok) {
        throw new Error("Failed to update config");
      }
      alert("Configuration updated successfully!");
    } catch (error) {
      console.error("Error updating config:", error);
      alert("Error updating configuration");
    }
  };

  // Reset config to the default values
  const handleReset = () => {
    setConfig(defaultConfig);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Header
        page="Edit Config"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-3xl mb-6 text-center">Edit Configuration</h1>
        <form onSubmit={handleSubmit} className="space-y-6 ">
          {/* Face Mesh Options */}
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-2xl mb-4">Face Mesh Options</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Max Num Faces</label>
                <input
                  type="number"
                  value={config.faceMeshOptions.maxNumFaces}
                  onChange={(e) =>
                    handleInputChange(
                      "faceMeshOptions",
                      "maxNumFaces",
                      Number(e.target.value)
                    )
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Refine Landmarks</label>
                <select
                  value={
                    config.faceMeshOptions.refineLandmarks ? "true" : "false"
                  }
                  onChange={(e) =>
                    handleInputChange(
                      "faceMeshOptions",
                      "refineLandmarks",
                      e.target.value === "true"
                    )
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Min Detection Confidence</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.faceMeshOptions.minDetectionConfidence}
                  onChange={(e) =>
                    handleInputChange(
                      "faceMeshOptions",
                      "minDetectionConfidence",
                      Number(e.target.value)
                    )
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Min Tracking Confidence</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.faceMeshOptions.minTrackingConfidence}
                  onChange={(e) =>
                    handleInputChange(
                      "faceMeshOptions",
                      "minTrackingConfidence",
                      Number(e.target.value)
                    )
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          </div>

          {/* Pose Options */}
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-2xl mb-4">Pose Options</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Model Complexity</label>
                <input
                  type="number"
                  value={config.poseOptions.modelComplexity}
                  onChange={(e) =>
                    handleInputChange(
                      "poseOptions",
                      "modelComplexity",
                      Number(e.target.value)
                    )
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Smooth Landmarks</label>
                <select
                  value={config.poseOptions.smoothLandmarks ? "true" : "false"}
                  onChange={(e) =>
                    handleInputChange(
                      "poseOptions",
                      "smoothLandmarks",
                      e.target.value === "true"
                    )
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Enable Segmentation</label>
                <select
                  value={
                    config.poseOptions.enableSegmentation ? "true" : "false"
                  }
                  onChange={(e) =>
                    handleInputChange(
                      "poseOptions",
                      "enableSegmentation",
                      e.target.value === "true"
                    )
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Smooth Segmentation</label>
                <select
                  value={
                    config.poseOptions.smoothSegmentation ? "true" : "false"
                  }
                  onChange={(e) =>
                    handleInputChange(
                      "poseOptions",
                      "smoothSegmentation",
                      e.target.value === "true"
                    )
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Min Detection Confidence</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.poseOptions.minDetectionConfidence}
                  onChange={(e) =>
                    handleInputChange(
                      "poseOptions",
                      "minDetectionConfidence",
                      Number(e.target.value)
                    )
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Min Tracking Confidence</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.poseOptions.minTrackingConfidence}
                  onChange={(e) =>
                    handleInputChange(
                      "poseOptions",
                      "minTrackingConfidence",
                      Number(e.target.value)
                    )
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          </div>

          {/* Camera Options */}
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-2xl mb-4">Camera Options</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Width</label>
                <input
                  type="number"
                  value={config.camera.width}
                  onChange={(e) =>
                    handleInputChange("camera", "width", Number(e.target.value))
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Height</label>
                <input
                  type="number"
                  value={config.camera.height}
                  onChange={(e) =>
                    handleInputChange(
                      "camera",
                      "height",
                      Number(e.target.value)
                    )
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          </div>

          {/* Global Settings */}
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-2xl mb-4">Global Settings</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block mb-1">Attention Decrement Factor</label>
                <input
                  type="number"
                  value={config.attentionDecrementFactor}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      attentionDecrementFactor: Number(e.target.value),
                    }))
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Attention Increment Factor</label>
                <input
                  type="number"
                  value={config.attentionIncrementFactor}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      attentionIncrementFactor: Number(e.target.value),
                    }))
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1">No Face Decrement Factor</label>
                <input
                  type="number"
                  value={config.noFaceDecrementFactor}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      noFaceDecrementFactor: Number(e.target.value),
                    }))
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          </div>

          {/* Alerts Options */}
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-2xl mb-4">Alerts Options</h2>
            {/* Head Alerts */}
            <div className="mb-6">
              <h3 className="text-xl mb-2">Head Alerts</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Up Threshold</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.alerts.head.upThreshold}
                    onChange={(e) =>
                      handleInputChange("alerts", "head", {
                        ...config.alerts.head,
                        upThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Down Threshold</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.alerts.head.downThreshold}
                    onChange={(e) =>
                      handleInputChange("alerts", "head", {
                        ...config.alerts.head,
                        downThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Lateral Threshold</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.alerts.head.lateralThreshold}
                    onChange={(e) =>
                      handleInputChange("alerts", "head", {
                        ...config.alerts.head,
                        lateralThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Duration (ms)</label>
                  <input
                    type="number"
                    value={config.alerts.head.duration}
                    onChange={(e) =>
                      handleInputChange("alerts", "head", {
                        ...config.alerts.head,
                        duration: Number(e.target.value),
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>
              {/* Head Alerts Enabled Options */}
              <div className="mt-4">
                <h4 className="text-lg mb-2">Enabled Directions</h4>
                <div className="grid grid-cols-3 gap-4">
                  {["up", "down", "left", "right", "forward"].map((dir) => (
                    <div key={dir} className="flex items-center">
                      <label className="mr-2 capitalize">{dir}</label>
                      <select
                        value={
                          config.alerts.head.enabled[dir] ? "true" : "false"
                        }
                        onChange={(e) =>
                          handleNestedChange("alerts", "head", "enabled", {
                            ...config.alerts.head.enabled,
                            [dir]: e.target.value === "true",
                          })
                        }
                        className="w-full border p-2 rounded"
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mouth Alerts */}
            <div className="mb-6">
              <h3 className="text-xl mb-2">Mouth Alerts</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Threshold</label>
                  <input
                    type="number"
                    step="0.01"
                    value={config.alerts.mouth.threshold}
                    onChange={(e) =>
                      handleInputChange("alerts", "mouth", {
                        ...config.alerts.mouth,
                        threshold: Number(e.target.value),
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Duration (ms)</label>
                  <input
                    type="number"
                    value={config.alerts.mouth.duration}
                    onChange={(e) =>
                      handleInputChange("alerts", "mouth", {
                        ...config.alerts.mouth,
                        duration: Number(e.target.value),
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-1">Enabled</label>
                  <select
                    value={config.alerts.mouth.enabled ? "true" : "false"}
                    onChange={(e) =>
                      handleInputChange("alerts", "mouth", {
                        ...config.alerts.mouth,
                        enabled: e.target.value === "true",
                      })
                    }
                    className="w-full border p-2 rounded"
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Gaze Alerts */}
            <div className="mb-6">
              <h3 className="text-xl mb-2">Gaze Alerts</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Duration (ms)</label>
                  <input
                    type="number"
                    value={config.alerts.gaze.duration}
                    onChange={(e) =>
                      handleInputChange("alerts", "gaze", {
                        ...config.alerts.gaze,
                        duration: Number(e.target.value),
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Enabled</label>
                  <select
                    value={config.alerts.gaze.enabled ? "true" : "false"}
                    onChange={(e) =>
                      handleInputChange("alerts", "gaze", {
                        ...config.alerts.gaze,
                        enabled: e.target.value === "true",
                      })
                    }
                    className="w-full border p-2 rounded"
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Head Pose Alerts */}
            <div>
              <h3 className="text-xl mb-2">Head Pose Alerts</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">Neutral Range</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.alerts.headPose.neutralRange}
                    onChange={(e) =>
                      handleInputChange("alerts", "headPose", {
                        ...config.alerts.headPose,
                        neutralRange: Number(e.target.value),
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Smoothing Frames</label>
                  <input
                    type="number"
                    value={config.alerts.headPose.smoothingFrames}
                    onChange={(e) =>
                      handleInputChange("alerts", "headPose", {
                        ...config.alerts.headPose,
                        smoothingFrames: Number(e.target.value),
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Reference Frames</label>
                  <input
                    type="number"
                    value={config.alerts.headPose.referenceFrames}
                    onChange={(e) =>
                      handleInputChange("alerts", "headPose", {
                        ...config.alerts.headPose,
                        referenceFrames: Number(e.target.value),
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form actions */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Reset to Default
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditConfig.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};
export default EditConfig;
