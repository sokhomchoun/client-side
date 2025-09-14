import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download} from "lucide-react";

const DownloadFile = () => {
    const [fileUrl, setFileUrl] = useState<string>("");
    const [fileName, setFileName] = useState<string>("file");
    const [fileSize, setFileSize] = useState<string>("Fetching...");
    const [downloadBlobUrl, setDownloadBlobUrl] = useState<string>("");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        return () => {
            if (downloadBlobUrl) {
                URL.revokeObjectURL(downloadBlobUrl);
            }
        };
    }, [downloadBlobUrl]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const url = params.get("url");
        const name = params.get("name");

        if (!url) {
            setError("Missing or invalid file URL.");
            setFileSize("Unknown");
            return;
        }

        setFileUrl(url);
        if (name) setFileName(name);

        fetch(url).then(async (res) => {
            if (!res.ok) throw new Error(`Failed to fetch file (${res.status})`);
            const blob = await res.blob();
            const kb = (blob.size / 1024).toFixed(2);
            setFileSize(`${kb} KB`);
            const objectUrl = URL.createObjectURL(blob);
            setDownloadBlobUrl(objectUrl);

        }).catch((err) => {
            console.error("Download error:", err);
            setFileSize("Unknown");
            setDownloadBlobUrl("");
            setError("Unable to fetch file. It may be protected or not CORS-enabled. Falling back to direct download.");
        });

    }, []);

    return (
        <main className="flex justify-center items-center h-screen bg-gray-100">
            <div>
                <div className="flex justify-center mb-6">
                    {/* <Link to="/"> */}
                        <img alt="Mangrove Studio" className="h-16" src="/lovable-uploads/daa5d3f6-9c34-4316-a0a1-b80c8d48e5c4.png" />
                    {/* </Link> */}
                </div>
                <div className="flex justify-center items-center">
                    <div className="bg-indigo-100 p-6 rounded-xl text-center shadow-md max-w-sm">
                        <div className="flex justify-center mb-4">
                            <div className="bg-black p-4 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                                </svg>
                            </div>
                        </div>
                        <h2 className="font-semibold text-lg text-black">{fileName || "No file specified"}</h2>
                        <p className="text-gray-600 text-sm mb-2">Size: {fileSize}</p>
                        {downloadBlobUrl ? (
                        <a href={downloadBlobUrl} download={fileName} className="inline-block mt-2 px-4 py-2 text-white font-semibold rounded-md ">
                            <Button type="button" className="w-full">
                                <Download className="h-4 w-4" />
                                Download
                            </Button>
                        </a>
                        ) : fileUrl ? (
                            <div>
                                <p className="mt-4 text-sm text-yellow-600">{error}</p>
                                <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 px-4 py-2 text-white font-semibold rounded-md ">
                                    <Button type="button" className="w-full">
                                        <Download className="h-4 w-4" />
                                        Download
                                    </Button>
                                </a>
                            </div>
                        ) : (
                        <p className="mt-4 text-sm text-red-500">
                            {error || "Unable to prepare download"}
                        </p>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default DownloadFile;
