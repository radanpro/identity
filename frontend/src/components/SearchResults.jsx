import PropTypes from "prop-types";

const SearchResults = ({ imageResults, errorMessage }) => {
  const results = imageResults?.results || [];

  return (
    <div className="mt-4 flex w-full justify-center">
      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-md">
          {errorMessage}
        </div>
      )}

      {results.length > 0 ? (
        <div className="w-full max-w-6xl">
          <h2 className="text-2xl font-bold mb-4 text-center">نتائج البحث</h2>
          <div className="flex gap-6">
            {/* بيانات الطالب */}
            <div className="w-1/2 p-2 border border-gray-300 rounded-lg bg-gray-50 text-center">
              <h3 className="text-lg font-bold mb-4 p-4 border border-sky-200 rounded-sm shadow-md">
                بيانات الطالب
              </h3>
              {results.map((student, index) => (
                <div
                  key={index}
                  className="mb-4 p-2 border-2 border-sky-400 rounded-lg bg-gray-50 h-64 "
                >
                  <div className="flex items-center gap-4 ">
                    <img
                      src={`http://127.0.0.1:3000/static/${student.ImagePath}`}
                      alt="Student"
                      className="w-1/2 rounded-md border-2 border-gray-300 h-60"
                    />
                    <div className="flex-col">
                      <div className="flex justify-between w-full">
                        <p>{student.StudentName}</p>
                        <p>
                          <strong>الاسم</strong>
                        </p>
                      </div>
                      <div className="flex justify-between w-full">
                        <p>{student.Number}</p>
                        <p>
                          <strong>رقم القيد</strong>
                        </p>
                      </div>
                      <div className="flex justify-between w-full">
                        <p>{student.College}</p>
                        <p>
                          <strong>الكلية</strong>
                        </p>
                      </div>
                      <div className="flex justify-between w-full">
                        <p>{student.Specialization}</p>
                        <p>
                          <strong>التخصص</strong>
                        </p>
                      </div>
                      <div className="flex justify-between w-full">
                        <p>{student.Level}</p>
                        <p>
                          <strong>المستوى</strong>
                        </p>
                      </div>
                      <div className="flex justify-between w-full">
                        <p>{student.similarity.toFixed(2)}%</p>
                        <p>
                          <strong>درجة التشابه</strong>
                        </p>
                      </div>
                      <div className="flex justify-between w-full">
                        <p>{new Date(student.created_at).toLocaleString()}</p>
                        <p>
                          <strong> Date</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* بيانات الاختبار */}
            <div className="w-1/2 p-4 border-4 rounded-lg bg-gray-50 text-center">
              <h3 className="text-lg font-bold mb-4 p-4 border border-sky-200 rounded-sm shadow-md">
                بيانات الاختبار
              </h3>
              {results.map((student, index) => (
                <div
                  key={index}
                  className={`mb-4 p-2 h-64 border-4 rounded-lg bg-gray-50 text-center ${
                    student.isExamTimeValid
                      ? "border-green-500"
                      : "border-red-500"
                  }`}
                >
                  <p>
                    {student.exam_data.exam_date}{" "}
                    <strong>: تاريخ الاختبار</strong>
                  </p>
                  <p>
                    <strong>الفترة :</strong>{" "}
                    {student.exam_data.exam_start_time} -{" "}
                    {student.exam_data.exam_end_time}
                  </p>
                  <p>
                    {student.College} <strong> : الكلية</strong>
                  </p>
                  <p>
                    {student.Level} <strong>: المستوى</strong>
                  </p>
                  <p>
                    {student.Specialization} <strong>: التخصص</strong>
                  </p>
                  <p>
                    <strong>الحالة:</strong>{" "}
                    {student.isExamTimeValid ? "ضمن الوقت" : "خارج الوقت"}
                  </p>
                  <p>
                    <strong>رقم الجهاز:</strong>{" "}
                    {student.exam_distribution.device_id}
                  </p>
                  <div>
                    <p>
                      <strong> : current_time </strong>{" "}
                      {student.time_window.current_time}
                    </p>
                    <p>
                      <strong>valid_end :</strong>{" "}
                      {student.time_window.valid_end}
                    </p>
                    <p>
                      <strong> valid_start :</strong>{" "}
                      {student.time_window.valid_start}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        !errorMessage && (
          <div className="bg-yellow-100 text-yellow-700 p-4 mb-4 rounded-md">
            لا توجد نتائج للعرض.
          </div>
        )
      )}
    </div>
  );
};

SearchResults.propTypes = {
  imageResults: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  errorMessage: PropTypes.string,
};

export default SearchResults;
