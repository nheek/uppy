import { useState } from "react";
import Image from "next/image";
import Cookies from "js-cookie";

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null); // Relative URL for the file
  const [fullUrl, setFullUrl] = useState<string | null>(null); // Full URL for sharing

  // Check if user is logged in
  const isLoggedIn = Cookies.get("token");

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
      alert("Please select a file.");
      return;
    }

    // Validate file size (10 MB limit)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      alert("File size exceeds the 10 MB limit.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const token = Cookies.get("token");
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
      alert("File uploaded successfully");
    } else {
      const errorMessage = await response.json();
      alert(`File upload failed: ${errorMessage.message}`);
    }
  };

  const copyToClipboard = () => {
    if (fullUrl) {
      navigator.clipboard.writeText(fullUrl);
      alert("Link copied to clipboard!");
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
          className="bg-blue-500 text-white p-2 rounded shadow hover:bg-blue-600 transition"
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
              <Image
                src={fileUrl}
                alt="Uploaded file"
                width={0} // Adjust the width as needed
                height={0} // Adjust the height as needed
                sizes="16rem"
                className="mt-4"
                style={{height: "100%", width:"100%"}}

              />
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
