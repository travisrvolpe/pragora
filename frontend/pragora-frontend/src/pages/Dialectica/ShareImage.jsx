import React, { useState } from 'react';
import { Image, X, Upload } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ShareImage = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [caption, setCaption] = useState('');
  const maxImages = 4;

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (images.length === 0) {
    alert("Please upload at least one image.");
    return;
  }

  const formData = new FormData();
  formData.append("post_type_id", "2"); // 2 for Image Post
  formData.append("content", caption || "Image post"); // Add content field which is required
  formData.append("caption", caption);

  // Debug log
  console.log('Submitting image post with data:', {
    post_type_id: 2,
    content: caption || "Image post",
    caption: caption,
    numberOfImages: images.length
  });

  images.forEach((image) => {
    formData.append("files", image.file);
  });

  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.post("http://localhost:8000/posts/", formData, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
        // Remove Content-Type header to let browser set it correctly for FormData
      },
    });

    console.log('Response:', response.data);

    if (response.data.status === "success") {
      setImages([]);
      setCaption("");
      const post_id = response.data.data.post.post_id;
      if (post_id) {
        navigate(`/post/${post_id}`);
      }
    }
  } catch (error) {
    console.error("Failed to create post:", error.response?.data);
    alert("An error occurred. Please try again.");
  }
};


  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-500 p-2 rounded-full">
          <Image className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Share Images</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="space-y-4">
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < maxImages && (
              <div className="text-center">
                <label className="cursor-pointer inline-block">
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">
                      Click to upload images ({maxImages - images.length} remaining)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <div>
          <textarea
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
            maxLength={500}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => {
              setImages([]);
              setCaption('');
            }}
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={images.length === 0}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Share
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShareImage;