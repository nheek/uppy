import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCopy, faCrop, faEye, faFileAlt } from "@fortawesome/free-solid-svg-icons";
import Modal from "@/app/components/Modal/Modal";

interface File {
  id: number;
  original_name: string;
  saved_name: string;
}

const MyFiles = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [cropData, setCropData] = useState<string | null>(null);
  const [cropper, setCropper] = useState<Cropper | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<File | null>(null);

  const showModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setIsModalVisible(true);
  };

  const fetchFiles = async () => {
    const token = Cookies.get("token");
    const response = await fetch("/api/files", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      setFiles(data);
    } else {
      showModal("Error", "Failed to fetch files.");
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setIsLoggedIn(true);
      fetchFiles();
    }
    setLoading(false); // Once token check is done, stop loading
  }, []);

  // Render a loading spinner or nothing while checking login status
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-xl font-bold text-blue-600">Loading...</div>;
  }

  // Render a message if the user is not logged in
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <p className="text-xl mb-4 font-bold text-red-300">
          You must be logged in to view your files.
        </p>
      </div>
    );
  }

  const deleteFile = async (fileId: number, savedName: string) => {
    const token = Cookies.get("token");
    const response = await fetch("/api/delete-file", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileId, savedName }),
    });

    if (response.ok) {
      showModal("Success", "File deleted successfully!");
      fetchFiles(); // Refresh file list
    } else {
      showModal("Error", "Failed to delete file.");
    }
  };

  const confirmDelete = (file: File) => {
    setFileToDelete(file);
    setIsDeleteConfirmationVisible(true);
  };

  const handleDeleteConfirmation = () => {
    if (fileToDelete) {
      deleteFile(fileToDelete.id, fileToDelete.saved_name);
    }
    setIsDeleteConfirmationVisible(false);
    setFileToDelete(null);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    showModal("Success", "Link copied to clipboard!");
  };

  const uploadCroppedImage = async (base64Image: string, savedName: string) => {
    const token = Cookies.get("token");
    const response = await fetch("/api/upload-cropped", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ croppedImage: base64Image, savedName }),
    });

    if (response.ok) {
      showModal("Success", "Cropped image saved successfully!");
      fetchFiles(); // Refresh file list
    } else {
      showModal("Error", "Failed to save cropped image.");
    }
  };

  const getCropData = () => {
    if (cropper) {
      const croppedImage = cropper.getCroppedCanvas().toDataURL();
      setCropData(croppedImage);
      uploadCroppedImage(croppedImage, selectedFile!.split("/").pop()!); // Get original file name
    }
  };

  const renderFilePreview = (file: File) => {
    const fileExtension = file.saved_name.split(".").pop()?.toLowerCase();

    // Define a fixed size for the previews
    const previewSize = "w-full h-40";
    const allowedImages = ["jpg", "png", "jpeg"];
    const allowedDocuments = ["pdf"];

    // Check if it's an image
    if (allowedImages.includes(fileExtension!)) {
      return (
        <img
          src={`/uploads/${file.saved_name}`}
          alt="Preview"
          className={`rounded shadow object-cover ${previewSize}`}
        />
      );
    }
    // Check if it's a PDF
    else if (allowedDocuments.includes(fileExtension!)) {
      return (
        <iframe
          src={`/uploads/${file.saved_name}#toolbar=0`}
          title={file.original_name}
          className={`border rounded shadow ${previewSize}`}
        ></iframe>
      );
    }
    // For other document types
    else {
      return (
        <div
          className={`flex items-center justify-center ${previewSize} border-dashed border-gray-300 rounded shadow`}
        >
          <FontAwesomeIcon
            icon={faFileAlt}
            className="text-gray-500"
            size="2x"
          />
          <p className="text-gray-500 ml-2">Preview not available</p>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6">
      <h1 className="text-4xl mb-4 font-bold text-blue-600">My Files</h1>

      {files.length === 0 ? (
        <p className="text-gray-600">No files uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="p-4 shadow rounded border-2 border-white border-opacity-50 text-black"
            >
              <p className="font-semibold mb-4 text-gray-200">
                {file.original_name}
              </p>
              {renderFilePreview(file)} {/* Render preview */}
              <div className="mt-4 flex items-center justify-center gap-4">
                <a
                  href={`/uploads/${file.saved_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 py-1 px-2 rounded hover:bg-blue-100 transition"
                  title="Open File"
                >
                  <FontAwesomeIcon icon={faEye} className="text-blue-600" />
                </a>
                <button
                  onClick={() => confirmDelete(file)}
                  className="py-1 px-2 rounded hover:bg-red-100 transition"
                  title="Delete"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-red-500" />
                </button>
                <button
                  onClick={() => copyToClipboard(`/uploads/${file.saved_name}`)}
                  className="py-1 px-2 rounded hover:bg-gray-200 transition"
                  title="Copy Shareable Link"
                >
                  <FontAwesomeIcon icon={faCopy} className="text-gray-500" />
                </button>
                {/* For image files, allow crop/resize */}
                {file.saved_name.endsWith(".jpg") ||
                file.saved_name.endsWith(".png") ? (
                  <button
                    onClick={() =>
                      setSelectedFile(`/uploads/${file.saved_name}`)
                    }
                    className="py-1 px-2 rounded hover:bg-blue-100 transition"
                    title="Edit (Crop)"
                  >
                    <FontAwesomeIcon icon={faCrop} className="text-blue-500" />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Cropper Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <Cropper
              src={selectedFile}
              style={{ height: 400, width: "100%" }}
              initialAspectRatio={1}
              aspectRatio={1}
              guides={false}
              onInitialized={(instance) => {
                setCropper(instance);
              }}
            />
            <button
              onClick={getCropData}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded"
            >
              Crop
            </button>
            <button
              onClick={() => setSelectedFile(null)}
              className="mt-4 bg-red-600 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      <Modal
        isVisible={isDeleteConfirmationVisible}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the file '${fileToDelete?.original_name}'?`}
        onClose={() => setIsDeleteConfirmationVisible(false)}
        closeBtn={false}
      >
        <div className="flex justify-between">
          <button
            onClick={handleDeleteConfirmation}
            className="bg-red-400 text-white py-2 px-4 rounded"
          >
            Delete
          </button>
          <button
            onClick={() => setIsDeleteConfirmationVisible(false)}
            className="bg-gray-300 text-black py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Main Modal for Other Messages */}
      <Modal
        isVisible={isModalVisible}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setIsModalVisible(false)}
      />
    </div>
  );
};

export default MyFiles;
