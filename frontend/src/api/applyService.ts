import { AxiosResponse } from 'axios';
import axiosClient from './axiosClient';

const END_POINT = {
    POST_APPLY: "apply-form", 
    CHECK_APPLIED: "apply-form/check-applied",
    GET_APPLIED_JOB: "apply-form/applied-jobs",
    GET_APPLICANTS: "apply-form/applicants",
    UPDATE_STATUS: "apply-form/update-status"

};
 
export const PostApply = async (data: FormData, token: string | null) => {
    if (!token) {
        throw new Error("No token provided");
    }

    try {
        const response: AxiosResponse = await axiosClient.post(`${END_POINT.POST_APPLY}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,  // Đảm bảo truyền token đúng cách
                'Content-Type': 'multipart/form-data',  // Ensure the correct content type
            },
        });
        return response;
    } catch (error) {
        console.error("Error applying for job:", error);
        throw error;
    }
};

export const CheckApplied = async (jobPostingId: string, token: string | null) => {
    const response: AxiosResponse = await axiosClient.get(`${END_POINT.CHECK_APPLIED}/${jobPostingId}`, {
        headers: {
            Authorization: `Bearer ${token}` 
        },
    });
    return response;
};


export const GetAppliedJob = async (pageNumber:any, pageSize:any , token: string | null) => {
    const response = await axiosClient.get(`${END_POINT.GET_APPLIED_JOB}?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
        headers: {
            Authorization: `Bearer ${token}` 
        },
    });
    return response;
};

export const GetApplicantsForJob = async (pageNumber:any, pageSize:any , token: string | null, jobPostingID: string | null) => {
    const response = await axiosClient.get(`${END_POINT.GET_APPLICANTS}/${jobPostingID}?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
        headers: {
            Authorization: `Bearer ${token}` 
        },
    });
    return response;
};

export const UpdateApplicantStatus = async (token: string | null, jobPostingID: string | null, candidateID: string | null, status: number): Promise<AxiosResponse> => {
    if (!token) {
        throw new Error("No token provided");
    }

    try {
        const response: AxiosResponse = await axiosClient.put(`${END_POINT.UPDATE_STATUS}/${jobPostingID}/${candidateID}`, status, {
            headers: {
                Authorization: `Bearer ${token}`, 
            },
        });
        return response; 
    } catch (error) {
        console.error("Error updating status:", error);
        throw error; 
    }
};
 
 