// src/utils/storage.js

// دالة لتخزين البيانات مع صلاحية محددة
export const setWithExpiry = (key, value, ttl) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  console.log(`تخزين ${key}:`, item);
  localStorage.setItem(key, JSON.stringify(item));
};

// دالة لاسترجاع البيانات مع التحقق من انتهاء الصلاحية
export const getWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  console.log(`استرجاع ${key}:`, item);
  return item.value;
};
