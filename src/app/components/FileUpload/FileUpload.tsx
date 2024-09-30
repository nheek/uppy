import { useState } from "react";
import Cookies from "js-cookie";

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null); // State for the file URL

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
      const { fileUrl } = await response.json();
      setFileUrl(fileUrl); // Set the file URL state
      alert("File uploaded successfully");
    } else {
      const errorMessage = await response.json();
      alert(`File upload failed: ${errorMessage.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl mb-4 font-bold text-blue-600">Upload your files</h1>
      <form onSubmit={handleFileUpload} className="mb-4 flex flex-col items-center">
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-4 border border-blue-500 rounded p-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded shadow hover:bg-blue-600 transition">
          Upload File
        </button>
      </form>

      {/* Display the uploaded file URL and preview */}
      {fileUrl && (
        <div className="mt-4 p-4 bg-white shadow rounded">
          <h2 className="text-lg font-semibold">File uploaded!</h2>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            Click here to download/view your file
          </a>
          {/* Preview for image files */}
          {selectedFile?.type.startsWith('image/') && (
            <div className="mt-2">
              <img src={fileUrl} alt="Uploaded file" className="w-64 h-auto border rounded shadow" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
