import React, { ReactNode } from "react";

interface ModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  children?: ReactNode; // Optional children prop
  closeBtn?: boolean; // Optional closeBtn prop
}

const Modal: React.FC<ModalProps> = ({
  isVisible,
  title,
  message,
  onClose,
  children,
  closeBtn = true,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-500 text-gray-100 rounded-lg shadow-lg w-11/12 max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        {children && <div className="mb-4">{children}</div>} {/* Render children if provided */}
        {
          closeBtn &&
            <button
              onClick={onClose}
              className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mr-0 ml-auto"
            >
              Close
            </button>
        }
      </div>
    </div>
  );
};

export default Modal;
