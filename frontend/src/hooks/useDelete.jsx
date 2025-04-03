// useDelete.js
import { useState } from "react";
import axios from "axios";

const useDelete = ({
  baseUrl,
  successDeleteMessageText,
  errorDeleteMessageText,
  refreshData,
}) => {
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    name: "",
  });
  const [feedback, setFeedback] = useState({ success: null, error: null });

  const openDeleteModal = (id, name) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: null, name: "" });
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${baseUrl}/${deleteModal.id}`);
      setFeedback({ success: successDeleteMessageText, error: null });
      refreshData();
      closeDeleteModal();
    } catch (error) {
      console.error("Error during deletion:", error);
      setFeedback({ success: null, error: errorDeleteMessageText });
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

export default useDelete;
