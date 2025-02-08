import React, { useState, useRef, useEffect } from 'react';
import AdminLayout from '../../../../app/adminLayout';
import { PostSampleCV } from '@/api/sampleCVService';
import { PostPolicy } from '@/api/policyService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const AddPolicy = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); 
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); 
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
    
    setErrorMessage('');
    return true;
  };
 
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('Title', title);
    formData.append('Description', description); 
 

    if (userToken) {
      try {
        const response = await PostPolicy(formData, userToken); // Replace with actual API call
        toast.success('Policy posted successfully!');
        setTitle('');
        setDescription('');  
      } catch (error) {
        console.error('Error posting policy template:', error);
        toast.error('Failed to post policy template.');
      }
    } else {
      toast.error('User is not authenticated.');
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-semibold mb-6 text-black-color">Policy Management</h1>

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

        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>} 

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Add Policy
        </button>
      </div>
    </AdminLayout>
  );
}; 

export default AddPolicy;
