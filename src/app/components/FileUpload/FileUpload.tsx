import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Modal from "@/app/components/Modal/Modal";

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null); // Relative URL for the file
  const [fullUrl, setFullUrl] = useState<string | null>(null); // Full URL for sharing
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // For login check
  const [loading, setLoading] = useState(true); // Loading state

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalMessage, setModalMessage] = useState<string>("");

  // Check if user is logged in
  useEffect(() => {
    const token = Cookies.get("token");
    setIsLoggedIn(!!token);
    setLoading(false);
  }, []);

  // Render a loading spinner while checking login status
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <p className="text-xl mb-4 font-bold text-blue-600">Loading...</p>
      </div>
    );
  }

  // Render a message if the user is not logged in
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <p className="text-xl mb-4 font-bold text-red-600">
          You must be logged in to upload files.
        </p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setModalTitle("Error");
      setModalMessage("Please select a file.");
      setIsModalVisible(true);
      return;
    }

    // Validate file size (10 MB limit)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      setModalTitle("Error");
      setModalMessage("File size exceeds the 10 MB limit.");
      setIsModalVisible(true);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const token = Cookies.get("token");
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const { fileUrl, fullUrl } = await response.json();
        setFileUrl(fileUrl); // Set the relative URL for the file preview
        setFullUrl(fullUrl); // Set the full URL for sharing
        setModalTitle("Success");
        setModalMessage("File uploaded successfully.");
        setIsModalVisible(true);
      } else {
        const errorMessage = await response.json();
        setModalTitle("Error");
        setModalMessage(`File upload failed: ${errorMessage.message}`);
        setIsModalVisible(true);
      }
    } catch (error) {
      setModalTitle("Error");
      if (error instanceof Error) {
        setModalMessage(error.message);
      } else {
        setModalMessage("An unknown error occurred.");
      }
      setIsModalVisible(true);
    }
  };

  const copyToClipboard = () => {
    if (fullUrl) {
      navigator.clipboard.writeText(fullUrl);
      setModalTitle("Success");
      setModalMessage("Link copied to clipboard!");
      setIsModalVisible(true);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-4xl mb-4 font-bold text-blue-600">
        Upload your files
      </h1>
      <form
        onSubmit={handleFileUpload}
        className="mb-4 flex flex-col items-center"
      >
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-4 border border-blue-500 rounded p-2 text-white"
        />
        <button
          type="submit"
          className="w-full h-14 bg-blue-500 text-white p-2 rounded shadow hover:bg-blue-600 transition"
        >
          Upload File
        </button>
      </form>

      {/* Display the uploaded file URL and preview */}
      {fileUrl && (
        <div className="mt-4 p-4 border-2 border-gray-300 border-opacity-50 rounded">
          <h2 className="text-lg font-semibold text-white text-opacity-40">
            File uploaded!
          </h2>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Click here to download/view your file
          </a>
          <button
            onClick={copyToClipboard}
            className="block mt-2 bg-gray-200 text-black p-1 rounded shadow hover:bg-gray-300"
          >
            Copy Shareable Link
          </button>
          {/* Preview for image files */}
          {selectedFile?.type.startsWith("image/") && (
            <div className="mt-2">
              <img src={fileUrl} alt="Uploaded file" className="w-64 h-auto" />
            </div>
          )}
        </div>
      )}

      {/* Custom Modal */}
      <Modal
        isVisible={isModalVisible}
        title={modalTitle}
        message={modalMessage}
        onClose={closeModal}
      />
    </div>
  );
};

export default FileUpload;
