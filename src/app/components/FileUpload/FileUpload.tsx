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

  useEffect(() => {
    const token = Cookies.get("token");
    setIsLoggedIn(!!token);
    setLoading(false);
  }, []);

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
      <h1 className="text-4xl mb-4 font-bold text-blue-950">
        Upload your files
      </h1>
      <form
        onSubmit={handleFileUpload}
        className="mb-4 flex flex-col items-center"
      >
        <input
          type="file"
          onChange={handleFileChange}
          className="neu bg-blue-950 mb-4 rounded-3xl px-6 py-4 text-blue-950"
        />
        <button
          type="submit"
          className="neu w-full h-14 bg-blue-500 flex items-center justify-center gap-4 text-blue-950 mt-6 p-2 rounded-3xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#172554" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 4.2v10.3"/></svg>
          <span className="text-lg">Upload File</span>
        </button>
      </form>

      {/* Display the uploaded file URL and preview */}
      {fileUrl && (
        <div className="w-full md:min-w-max md:w-full mt-4">
          <div className="flex gap-2 md:gap-0 justify-between md:w-1/4 md:justify-center md:mx-auto">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener"
              className="md:w-1/2"
            >
              Download/View
            </a>
            <button
              onClick={copyToClipboard}
              className="md:w-1/2 md:text-right"
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
                className="w-max h-auto mx-auto"
              />
            </div>
          )}

          {/* Preview for PDF files */}
          {selectedFile?.type === "application/pdf" && (
            <div className="mt-2 w-full">
              <iframe
                src={fileUrl}
                className="w-full h-screen border"
                title="PDF Preview"
              ></iframe>
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
