import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import PropTypes from "prop-types";
ChartJS.register(...registerables);

const ChartComponent = ({ type, data, title }) => {
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  const renderChart = () => {
    switch (type) {
      case "bar":
        return <Bar data={data} options={chartOptions} />;
      case "pie":
        return <Pie data={data} options={chartOptions} />;
      case "line":
        return <Line data={data} options={chartOptions} />;
      default:
        return <Bar data={data} options={chartOptions} />;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">{renderChart()}</div>
  );
};
ChartComponent.propTypes = {
  type: PropTypes.oneOf(["bar", "pie", "line"]).isRequired,
  data: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
};

export default ChartComponent;
