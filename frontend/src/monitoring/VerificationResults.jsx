import PropTypes from "prop-types";

/**
 * VerificationResults - مكون لعرض نتائج التحقق من الطالب
 *
 * @param {Object} props - الخصائص المطلوبة
 * @param {Object} props.result - نتائج التحقق
 * @param {string} props.studentId - رقم الطالب
 * @param {File} props.selectedFile - ملف الصورة المختار
 * @param {string|number} props.deviceId - رقم الجهاز
 * @returns {JSX.Element} - عنصر React لعرض نتائج التحقق
 */
const VerificationResults = ({ result, studentId, selectedFile, deviceId }) => {
  return (
    <div className="mt-6 p-6 border-2 border-green-300 rounded-lg bg-green-50 shadow-lg">
      {/* العنوان الرئيسي */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-green-800 mb-2">نتائج التحقق</h3>
        <div className="w-20 h-1 bg-green-400 mx-auto"></div>
      </div>

      {/* قسم البيانات المرسلة */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h4 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
          البيانات المرسلة
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">
              <span className="font-medium text-green-700">رقم الطالب:</span>
              <span className="block mt-1 p-2 bg-gray-50 rounded">
                {studentId}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              <span className="font-medium text-green-700">رقم الجهاز:</span>
              <span className="block mt-1 p-2 bg-gray-50 rounded">
                {deviceId}
              </span>
            </p>
          </div>
        </div>

        {selectedFile && (
          <div className="mt-4">
            <p className="font-medium text-green-700 mb-2">الصورة المرسلة:</p>
            <div className="flex justify-center">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="الصورة المُرسلة"
                className="max-w-full h-auto max-h-64 border-2 border-gray-200 rounded-lg shadow"
              />
            </div>
          </div>
        )}
      </div>

      {/* قسم نتائج الفحص */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* فحص الجهاز */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
            فحص الجهاز
          </h4>
          <div className="space-y-3">
            <p className="text-gray-600">
              <span className="font-medium text-green-700">
                رقم الجهاز الصحيح:
              </span>
              <span
                className={`block mt-1 p-2 rounded ${
                  result.device_check.is_correct
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {result.device_check.correct_device_id}
              </span>
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-green-700">حالة الفحص:</span>
              <span
                className={`block mt-1 p-2 rounded font-bold ${
                  result.device_check.is_correct
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {result.device_check.is_correct ? "✓ صحيح" : "✗ غير صحيح"}
              </span>
            </p>
          </div>
        </div>

        {/* فحص الوجه */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
            فحص الوجه
          </h4>
          <div className="space-y-3">
            <p className="text-gray-600">
              <span className="font-medium text-green-700">مستوى الثقة:</span>
              <span
                className={`block mt-1 p-2 rounded ${
                  result.face_check.is_match
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {result.face_check.confidence}%
              </span>
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-green-700">حالة المطابقة:</span>
              <span
                className={`block mt-1 p-2 rounded font-bold ${
                  result.face_check.is_match
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {result.face_check.is_match ? "✓ متطابق" : "✗ غير متطابق"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* قسم بيانات الطالب */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
          بيانات الطالب
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600">
              <span className="font-medium text-green-700">الاسم:</span>
              <span className="block mt-1 p-2 bg-gray-50 rounded">
                {result.student_data.student_name}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              <span className="font-medium text-green-700">رقم الطالب:</span>
              <span className="block mt-1 p-2 bg-gray-50 rounded">
                {result.student_data.student_id}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              <span className="font-medium text-green-700">الكلية:</span>
              <span className="block mt-1 p-2 bg-gray-50 rounded">
                {result.student_data.college_name}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              <span className="font-medium text-green-700">
                السنة الأكاديمية:
              </span>
              <span className="block mt-1 p-2 bg-gray-50 rounded">
                {result.student_data.academic_year}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              <span className="font-medium text-green-700">اسم الدورة:</span>
              <span className="block mt-1 p-2 bg-gray-50 rounded">
                {result.student_data.course_name}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              <span className="font-medium text-green-700">اسم المركز:</span>
              <span className="block mt-1 p-2 bg-gray-50 rounded">
                {result.student_data.center_name}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              <span className="font-medium text-green-700">التخصص:</span>
              <span className="block mt-1 p-2 bg-gray-50 rounded">
                {result.student_data.major_name}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              <span className="font-medium text-green-700">رقم الغرفة:</span>
              <span className="block mt-1 p-2 bg-gray-50 rounded">
                {result.student_data.room_number}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              <span className="font-medium text-green-700">
                تاريخ الامتحان:
              </span>
              <span className="block mt-1 p-2 bg-gray-50 rounded">
                {result.student_data.exam_date}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              <span className="font-medium text-green-700">
                وقت بدء الامتحان:
              </span>
              <span className="block mt-1 p-2 bg-gray-50 rounded">
                {result.student_data.exam_start_time}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              <span className="font-medium text-green-700">
                وقت انتهاء الامتحان:
              </span>
              <span className="block mt-1 p-2 bg-gray-50 rounded">
                {result.student_data.exam_end_time}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// تحقق من أنواع الخصائص
VerificationResults.propTypes = {
  result: PropTypes.shape({
    device_check: PropTypes.shape({
      correct_device_id: PropTypes.number.isRequired,
      is_correct: PropTypes.bool.isRequired,
    }).isRequired,
    face_check: PropTypes.shape({
      confidence: PropTypes.number.isRequired,
      is_match: PropTypes.bool.isRequired,
    }).isRequired,
    student_data: PropTypes.shape({
      academic_year: PropTypes.string,
      center_name: PropTypes.string,
      college_name: PropTypes.string,
      course_name: PropTypes.string,
      device_number: PropTypes.number,
      exam_date: PropTypes.string,
      exam_end_time: PropTypes.string,
      exam_id: PropTypes.number,
      exam_start_time: PropTypes.string,
      level_name: PropTypes.string,
      major_name: PropTypes.string,
      room_number: PropTypes.string,
      semester_name: PropTypes.string,
      student_id: PropTypes.string,
      student_name: PropTypes.string,
    }).isRequired,
  }).isRequired,
  studentId: PropTypes.string.isRequired,
  selectedFile: PropTypes.object, // ملف الصورة المُختارة
  deviceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

export default VerificationResults;
