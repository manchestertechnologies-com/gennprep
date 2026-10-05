import { useState } from "react";
import api, { getErrorMessage } from "../api/axios";

// Upload, preview and remove the diagrams attached to a question
export default function QuestionImages({ images = [], onChange }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const upload = async (e) => {
        const file = e.target.files[0];
        e.target.value = ""; // lets the same file be chosen again later
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) return setError("Image must be 2 MB or smaller");

        setError("");
        setUploading(true);
        try {
            const data = new FormData();
            data.append("image", file);
            const res = await api.post("/admin/upload", data);
            onChange([...images, { ...res.data.image, alt: "" }]);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setUploading(false);
        }
    };

    const remove = (index) => onChange(images.filter((_, i) => i !== index));

    return (
        <div>
            <p className="text-xs font-medium text-slate-600 mb-1">Diagrams (optional)</p>

            <div className="flex flex-wrap gap-3">
                {images.map((img, index) => (
                    <div key={img.url} className="relative">
                        <img src={img.url} alt={img.alt || "Question diagram"} className="h-28 rounded-lg border border-slate-200 object-contain bg-white" />
                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-sm leading-6"
                            title="Remove image"
                        >
                            ×
                        </button>
                    </div>
                ))}

                <label
                    className={`h-28 w-36 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-sm text-slate-500 ${uploading ? "opacity-60" : "cursor-pointer hover:border-indigo-400 hover:text-indigo-600"
                        }`}
                >
                    {uploading ? "Uploading..." : "+ Add image"}
                    <span className="text-xs text-slate-400 mt-1">JPG or PNG, max 2 MB</span>
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={upload} disabled={uploading} className="hidden" />
                </label>
            </div>

            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
    );
}