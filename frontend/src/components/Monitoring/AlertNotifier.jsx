export async function notifyBackendAlert(message) {
  // جلب البيانات من verificationData
  const verificationDataRaw = localStorage.getItem("verificationData");
  const verificationData = JSON.parse(verificationDataRaw);
  //   console.log("التحقق من البيانات:", verificationData);

  const deviceData = JSON.parse(localStorage.getItem("deviceData"));
  //   console.log("التحقق من البيانات:", deviceData);
  //   console.log(deviceData.id);
  // تأكد إن البيانات موجودة
  const studentData =
    verificationData &&
    verificationData.value &&
    verificationData.value.result &&
    verificationData.value.result.student_data
      ? verificationData.value.result.student_data
      : null;

  if (!studentData) {
    console.error("لم يتم العثور على بيانات الطالب داخل verificationData");
    return;
  }

  //   console.log("بيانات الطالب:", studentData);

  // بيانات التنبيه التي نريد إرسالها
  const alertPayload = {
    alert_type: 2,
    device_id: deviceData ? deviceData.id : null, // من بيانات الطالب
    exam_id: studentData.exam_id, // من بيانات الطالب
    message: message,
    student_id: studentData.student_id, // من بيانات الطالب
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
      console.error("فشل إرسال التنبيه:", response.statusText);
      return null;
    }
    const data = await response.json();
    console.log("تم إرسال التنبيه بنجاح:", data);
    return data;
  } catch (error) {
    console.error("حدث خطأ أثناء إرسال التنبيه:", error);
    return null;
  }
}
