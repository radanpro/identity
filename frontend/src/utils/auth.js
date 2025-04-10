// src/utils/auth.js

export async function validateDeviceToken() {
  const token = localStorage.getItem("deviceToken");
  if (!token) return false;

  try {
    const response = await fetch(
      "http://127.0.0.1:3000/api/devices/validate-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      }
    );

    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    console.error("Error validating device token:", error);
    return false;
  }
}

export function isUserLoggedIn() {
  return !!sessionStorage.getItem("userToken");
}
export function isDeviceRegistered() {
  return !!localStorage.getItem("deviceToken");
}
export function printToken() {
  const token = localStorage.getItem("deviceToken");
  return token;
}

// دالة لاسترجاع بيانات الجهاز المحفوظة:
export function getDeviceData() {
  const deviceData = localStorage.getItem("deviceData");
  return deviceData ? JSON.parse(deviceData) : null;
}
