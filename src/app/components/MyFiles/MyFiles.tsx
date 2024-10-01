import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCopy, faCrop, faEye, faFileAlt } from '@fortawesome/free-solid-svg-icons';

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
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

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
      alert("Failed to load files");
    }
  };

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
      alert("File deleted successfully");
      fetchFiles(); // Refresh file list
    } else {
      alert("Failed to delete file");
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
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
      setMessage("Cropped image saved successfully!");
      fetchFiles(); // Refresh file list
    } else {
      setMessage("Failed to save cropped image.");
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
    const fileExtension = file.saved_name.split('.').pop()?.toLowerCase();
    
    // Define a fixed size for the previews
    const previewSize = "w-full h-40";

    // Check if it's an image
    if (fileExtension === "jpg" || fileExtension === "png") {
      return <img src={`/uploads/${file.saved_name}`} alt="Preview" className={`rounded shadow ${previewSize} object-cover`} />;
    } 
    // Check if it's a PDF
    else if (fileExtension === "pdf") {
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
        <div className={`flex items-center justify-center ${previewSize} border-dashed border-gray-300 rounded shadow`}>
          <FontAwesomeIcon icon={faFileAlt} className="text-gray-500" size="2x" />
          <p className="text-gray-500">Preview not available</p>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl mb-4 font-bold text-blue-600">My Files</h1>
      {message && <p className="text-green-600">{message}</p>}

      {files.length === 0 ? (
        <p className="text-gray-600">No files uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file.id} className="p-4 bg-white shadow rounded border text-black">
              <p className="font-semibold mb-2">{file.original_name}</p>
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
                  onClick={() => deleteFile(file.id, file.saved_name)}
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
                {file.saved_name.endsWith(".jpg") || file.saved_name.endsWith(".png") ? (
                  <button
                    onClick={() => setSelectedFile(`/uploads/${file.saved_name}`)}
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
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold">Crop Image</h2>
            <Cropper
              src={selectedFile}
              style={{ height: 400, width: "100%" }}
              initialAspectRatio={1}
              guides={false}
              cropBoxResizable={false}
              crop={getCropData}
              onInitialized={(instance) => setCropper(instance)}
            />
            <div className="mt-4">
              <button
                onClick={getCropData}
                className="bg-blue-500 text-white p-2 rounded shadow hover:bg-blue-600 transition"
              >
                Crop Image
              </button>
              <button
                onClick={() => setSelectedFile(null)}
                className="ml-2 bg-gray-500 text-white p-2 rounded shadow hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show cropped image */}
      {cropData && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Cropped Image</h2>
          <img src={cropData} alt="Cropped" className="border rounded shadow" />
        </div>
      )}
    </div>
  );
};

export default MyFiles;
