// src/components/AlertNotifier.js

/**
 * تُرسل هذه الدالة تنبيهًا إلى الباك إند.
 * يمكنك تعديل القيم الافتراضية مثل device_id أو exam_id حسب متطلباتك.
 */
export async function notifyBackendAlert(message) {
  // الحصول على بيانات الطالب من التخزين المؤقت (يمكنك تعديل مفتاح التخزين حسب مشروعك)
  const studentData = JSON.parse(localStorage.getItem("studentData")); // أو استخدم getWithExpiry من وحدة التخزين أدناه
  const student_id = studentData ? studentData.student_id : 0; // تأكد من أن بيانات الطالب متاحة
  console.log(studentData);
  // بيانات التنبيه التي نريد إرسالها
  const alertPayload = {
    alert_type: 2,
    device_id: 23,
    exam_id: 6,
    message: message,
    student_id: student_id,
  };

  try {
    const response = await fetch("http://127.0.0.1:3000/api/alerts/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(alertPayload),
    });
    if (!response.ok) {
      console.error("Error sending alert:", response.statusText);
      return null;
    }
    const data = await response.json();
    console.log("Alert sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending alert:", error);
    return null;
  }
}
