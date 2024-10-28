import React, { ReactNode } from "react";

interface ModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  children?: ReactNode;
  closeBtn?: boolean;
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
      <div className="neu-modal bg-gray-500 text-blue-950 rounded-lg shadow-lg w-11/12 max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        {children && <div className="mb-4">{children}</div>} {/* Render children if provided */}
        {
          closeBtn &&
            <button
              onClick={onClose}
              className="block bg-blue-950 text-white mt-2 px-6 py-2 rounded-3xl mr-0 ml-auto"
            >
              Close
            </button>
        }
      </div>
    </div>
  );
};

export default Modal;
