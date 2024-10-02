import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Modal from "@/app/components/Modal/Modal";

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null); // Relative URL for the file
  const [fullUrl, setFullUrl] = useState<string | null>(null); // Full URL for sharing
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalMessage, setModalMessage] = useState<string>("");

  const showModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setIsModalVisible(true);
  };

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
      showModal("Error", "Please select a file.");
      return;
    }

    // Validate file size (10 MB limit)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      showModal("Error", "File size exceeds the 10 MB limit.");
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
        showModal("Success", "File uploaded successfully.");
      } else {
        const errorMessage = await response.json();
        showModal("Error", errorMessage);
      }
    } catch (error) {
      if (error instanceof Error) {
        showModal("Error", error.message);
      } else {
        showModal("Error", "An unknown error occurred.");
      }
    }
  };

  const copyToClipboard = () => {
    if (fullUrl) {
      navigator.clipboard.writeText(fullUrl);
      showModal("Success", "Link copied to clipboard!");
    }
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
        <div className="w-full mt-4 p-4 border-2 border-gray-300 border-opacity-50 rounded">
          <div className="flex gap-2 justify-between">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener"
            >
              Download/View
            </a>
            <button
              onClick={copyToClipboard}
            >
              Copy Link
            </button>
          </div>

          {/* Preview for image files */}
          {selectedFile?.type.startsWith("image/") && (
            <div className="mt-2">
              <img
                src={fileUrl}
                alt="Uploaded file"
                className="w-full h-auto"
              />
            </div>
          )}
        </div>
      )}

      {/* Custom Modal */}
      <Modal
        isVisible={isModalVisible}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setIsModalVisible(false)}
      />
    </div>
  );
};

export default FileUpload;
