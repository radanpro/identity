import PropTypes from "prop-types";

const VectorSearchBar = ({ onSearch, onAdd, onVerifyAll, onAddVector }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <input
        type="text"
        placeholder="ابحث عن طالب..."
        onChange={(e) => onSearch(e.target.value)}
        className="p-2 border border-gray-300 rounded-md"
      />
      <div>
        <button
          onClick={onVerifyAll}
          className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-md ml-2 hover:bg-yellow-600 transition duration-300"
        >
          التحقق من جميع المتجهات
        </button>
        <button
          onClick={onAddVector}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md ml-2 hover:bg-blue-600 transition duration-300"
        >
          إضافة {onAdd} جديد
        </button>
      </div>
    </div>
  );
};

VectorSearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onAdd: PropTypes.string.isRequired,
  onVerifyAll: PropTypes.func.isRequired,
  onAddVector: PropTypes.func.isRequired,
};

export default VectorSearchBar;
