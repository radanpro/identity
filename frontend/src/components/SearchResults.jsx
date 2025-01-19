import PropTypes from "prop-types";

const SearchResults = ({ imageResults, studentsInfo }) => {
  return (
    <div className="mt-4 flex w-full justify-center">
      {imageResults.length > 0 && (
        <div className="w-full max-w-4xl">
          <h2 className="text-xl font-bold mb-4">نتائج البحث:</h2>
          <div className="flex gap-8">
            <table className="w-2/3 border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">اسم الطالب</th>
                  <th className="p-3 text-left">الكلية</th>
                  <th className="p-3 text-left">درجة التشابه</th>
                </tr>
              </thead>
              <tbody>
                {imageResults.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3 border-t border-gray-300">
                      {result.student_id}
                    </td>
                    <td className="p-3 border-t border-gray-300">
                      {result.college}
                    </td>
                    <td className="p-3 border-t border-gray-300">
                      {result.similarity.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="w-1/3 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <h3 className="text-lg font-bold mb-4">معلومات الطلاب</h3>
              {studentsInfo.map((student, index) => (
                <div key={index} className="mb-4">
                  <p>
                    <strong>الكلية:</strong> {student.College}
                  </p>
                  <p>
                    <strong>رقم القيد:</strong> {student.Number}
                  </p>
                  <p>
                    <strong>مسار الصورة:</strong>
                  </p>
                  <img
                    src={`http://127.0.0.1:8080/static/${student.ImagePath}`}
                    alt="Student"
                    className="mt-2"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

SearchResults.propTypes = {
  imageResults: PropTypes.array.isRequired,
  studentsInfo: PropTypes.array.isRequired,
};

export default SearchResults;
