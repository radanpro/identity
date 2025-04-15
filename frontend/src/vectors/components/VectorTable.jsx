import PropTypes from "prop-types";
import { Button } from "../../shared/Button";
import { useNavigate } from "react-router-dom";

const VectorTable = ({ currentVectors, truncateVector, onDelete }) => {
  // داخل الكومبوننت
  const navigate = useNavigate();
  const handleEditClick = (vectorId) => {
    navigate(`/vectors/edit-vector?id=${vectorId}`);
  };
  return (
    <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  رقم الطالب
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  الكلية
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  المتجه (20 رقم أولى)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentVectors.map((vector, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vector.student_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vector.college}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {truncateVector(vector.vector)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => handleEditClick(vector.id)}
                    >
                      تعديل
                    </Button>
                    <Button
                      className="ml-2 text-red-600 hover:text-red-900"
                      onClick={() =>
                        onDelete(vector.student_id, vector.student_id)
                      }
                    >
                      حذف
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

VectorTable.propTypes = {
  currentVectors: PropTypes.array.isRequired,
  truncateVector: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default VectorTable;
