import React, { useState, useRef, useEffect } from 'react';
import AdminLayout from '../../../../app/adminLayout';
import { PostSampleCV } from '@/api/sampleCVService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CVPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileCV, setFileCV] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      setUserToken(token);
    }
  }, []);

  const validateForm = () => {
    if (!title.trim()) {
      setErrorMessage('Title is required.');
      return false;
    }
    if (!description.trim()) {
      setErrorMessage('Description is required.');
      return false;
    }
    if (!fileCV) {
      setErrorMessage('Please upload a CV file (PDF only).');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleFileChange = () => {
    if (fileInput.current?.files) {
      const file = fileInput.current.files[0];
      if (file && file.type === 'application/pdf') {
        setFileCV(file);
      } else {
        setErrorMessage('Only PDF files are allowed.');
        setFileCV(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('Title', title);
    formData.append('Description', description);
    formData.append('FileCV', fileCV as File);


    if (userToken) {
      try {
        const response = await PostSampleCV(formData, userToken);
        toast.success("CV template uploaded successfully!");
        setTitle('');
        setDescription('');
        setFileCV(null);
        if (fileInput.current) fileInput.current.value = '';
      } catch (error) {
        console.error('Error uploading CV template:', error);
        setErrorMessage('Failed to upload CV template.');
      }
    } else {
      setErrorMessage('User is not authenticated.');
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-semibold mb-6 text-black-color">CV Templates Management</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="title" className="block text-black-color font-medium mb-2">
            Title:
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-black-color w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter title"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-black-color font-medium mb-2">
            Description:
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-black-color w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter description"
            rows={4}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="cv" className="block text-black-color font-medium mb-2">
            CV (PDF only):
          </label>
          <input
            type="file"
            ref={fileInput}
            className="block w-full text-black-color border rounded-md focus:ring-2 focus:ring-blue-500"
            accept=".pdf"
            onChange={handleFileChange}
          />
        </div>

        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Upload CV Template
        </button>
      </div>
    </AdminLayout>
  );
};

export default CVPage;
