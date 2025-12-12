// useDelete.js
import { useState } from "react";
import axios from "axios";

const useDeleteAlert = ({
  successDeleteMessageText,
  errorDeleteMessageText,
  refreshData,
}) => {
  // نحتفظ ببيانات التنبيه المُراد حذفه في deleteModal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    device_id: null,
    exam_id: null,
    student_id: null,
  });
  const [feedback, setFeedback] = useState({ success: null, error: null });

  // فتح مربع تأكيد الحذف مع تمرير بيانات التنبيه
  const openDeleteModal = (device_id, exam_id, student_id) => {
    setDeleteModal({ isOpen: true, device_id, exam_id, student_id });
  };

  // إغلاق مربع التأكيد
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      device_id: null,
      exam_id: null,
      student_id: null,
    });
  };

  // دالة الحذف التي ترسل طلب POST إلى الـ API
  const handleDelete = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:3000/api/alerts/delete-multiple",
        {
          items: [
            {
              device_id: deleteModal.device_id,
              exam_id: deleteModal.exam_id,
              student_id: deleteModal.student_id,
            },
          ],
        }
      );
      if (response.status === 200) {
        setFeedback({ success: successDeleteMessageText, error: null });
        // تحديث البيانات بعد الحذف
        refreshData();
      }
    } catch (error) {
      console.error("Error while deleting alert", error);
      setFeedback({ success: null, error: errorDeleteMessageText });
    } finally {
      closeDeleteModal();
    }
  };

  return {
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    feedback,
    setFeedback,
  };
};

export default useDeleteAlert;
