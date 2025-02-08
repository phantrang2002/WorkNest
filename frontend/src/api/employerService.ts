import { AxiosResponse } from 'axios';
import axiosClient from './axiosClient';

const END_POINT = { 
    PROFILE:  "employer/profile",
    COMPLETE:  "employer/profile/complete-info",
    UPLOAD_AVATAR:  "employer/upload-avatar",
    POSTED_JOBS:  "employer/job",
    PENDING_JOBS: "employer/job-pending",
    GET_AVAI_EM:  "employer/available",
    GET_LOCKED_EM:  "employer/locked",
    LOCK_AN_EMPLOYER: "employer/lock",
    UNLOCK_AN_EMPLOYER: "employer/unlock",
    EMPLOYER:  "employer",

}; 

export const GetMyEmployerProfile = async (token: string | null) => {
    const response: AxiosResponse = await axiosClient.get(`${END_POINT.PROFILE}`, {
        headers: {
            Authorization: `${token}`, // Add token to headers
        },
    });
    return response;
};

export const CheckCompleteMyEmployerProfile = async (token: string | null) => {
    const response: AxiosResponse = await axiosClient.get(`${END_POINT.COMPLETE}`, {
        headers: {
            Authorization: `${token}`, // Add token to headers
        },
    });
    return response;
};


export const GetEmployerProfile = async (employerId: string | string[]) => {
    const response: AxiosResponse = await axiosClient.get(`${END_POINT.EMPLOYER}/${employerId}`);
    return response;
};


export const UploadAvatarProfile = async (token: string | null, avatarFile: File) => {
    const formData = new FormData();
    
    // Check if the file is provided
    if (avatarFile) {
        formData.append('file', avatarFile); // Ensure 'file' is the expected field name by the server
    } else {
        throw new Error("No file provided.");
    }

    const response: AxiosResponse = await axiosClient.post(`${END_POINT.UPLOAD_AVATAR}`, formData, {
        headers: {
            Authorization: `Bearer ${token}`, // Add token to headers
            'Content-Type': 'multipart/form-data', // Set content type for file upload
        },
    });
    return response;
};
export const EditMyEmployerProfile = async (token: string | null, profileData: FormData): Promise<AxiosResponse> => {
    if (!token) {
        throw new Error("No token provided");
    }

    try {
        const response: AxiosResponse = await axiosClient.put(`${END_POINT.PROFILE}`, profileData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',  // Ensure the correct content type
            },
        });
        return response;  // Returning the full response
    } catch (error) {
        console.error("Error updating employer profile:", error);
        throw error;  // Throwing the error if the request fails
    }
};

export const GetPostedJob = async (pageNumber:any, pageSize:any , token: string | null) => {
    const response = await axiosClient.get(`${END_POINT.POSTED_JOBS}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response; 
};

export const GetMyPendingJob = async (pageNumber:any, pageSize:any , token: string | null) => {
    const response = await axiosClient.get(`${END_POINT.PENDING_JOBS}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response; 
};


 
export const GetAvaiEmployer = async (pageNumber:any, pageSize:any) => {
    const response = await axiosClient.get(`${END_POINT.GET_AVAI_EM}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response; 
};

export const GetLockedEmployer = async (pageNumber:any, pageSize:any) => {
    const response = await axiosClient.get(`${END_POINT.GET_LOCKED_EM}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response; 
};

export const LockAnEmployer = async (employerId: string, token: string | null) => {
    const response: AxiosResponse = await axiosClient.put(`${END_POINT.LOCK_AN_EMPLOYER}/${employerId}`, {
        headers: {
            Authorization: `${token}`, 
        },
    });
    return response;
};

export const UnlockAnEmployer = async (employerId: string, token: string | null) => {
    const response: AxiosResponse = await axiosClient.put(`${END_POINT.UNLOCK_AN_EMPLOYER}/${employerId}`, {
        headers: {
            Authorization: `${token}`, 
        },
    });
    return response;
};




