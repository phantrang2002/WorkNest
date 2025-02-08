import { AxiosResponse } from 'axios';
import axiosClient from './axiosClient';

const END_POINT = {
    POST_A_JOB: "job-posting",
    GET_ALL_JOBS: "job-posting",
    GET_ALL_JOBS_DOWNLOAD: "job-posting/download/job-postings-report/all",
    GET_RECRUIT_STATS_DOWNLOAD: "job-posting/download/job-postings-report/available-for-admin",
    SEARCH: "job-posting/search",
    GET_SUITABLE_JOBS: "job-posting/suitable",
    GET_ALL_JOBS_AVAI: "job-posting/available",
    GET_ALL_JOBS_AVAI_FOR_USER: "job-posting/available-for-user",
    GET_ALL_JOBS_AVAI_FOR_ADMIN: "job-posting/available-for-admin",
    GET_ALL_JOBS_PENDING: "job-posting/pending",
    GET_ALL_JOBS_EXPIRED: "job-posting/expired",
    GET_JOB_BY_ID: "job-posting",
    DELETE_A_JOB: "job-posting",
    APPROVE_A_JOB: "job-posting/approve",
    LOCK_A_JOB: "job-posting/lock",
    UNLOCK_A_JOB: "job-posting/unlock",
    GET_ALL_JOBS_ADMIN_LOCKED: "job-posting/admin-locked",
    GET_ALL_JOBS_EM_LOCKED: "job-posting/employer-locked"
};


export const PostAJob = async (data: any, token: string | null) => {
    const response: AxiosResponse = await axiosClient.post(`${END_POINT.POST_A_JOB}`, data, {
        headers: {
            Authorization: `${token}`,
        },
    });
    return response;
};

export const GetAllJobs = async (pageNumber: any, pageSize: any) => {
    const response = await axiosClient.get(`${END_POINT.GET_ALL_JOBS}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response;
};

export const GetAllJobsDownload = async () => {
    try {
        const response = await axiosClient.get(`${END_POINT.GET_ALL_JOBS_DOWNLOAD}`, {
            responseType: 'blob',
        });
        if (response instanceof Blob) {
            return response;
        } else {
            throw new Error('The server did not return a valid file.');
        }
    } catch (error) {
        console.error('Error downloading report:', error);
        throw error;
    }
};

export const GetRecruitmentStatsDownload = async () => {
    try {
        const response = await axiosClient.get(`${END_POINT.GET_RECRUIT_STATS_DOWNLOAD}`, {
            responseType: 'blob',
        });
        if (response instanceof Blob) {
            return response;
        } else {
            throw new Error('The server did not return a valid file.');
        }
    } catch (error) {
        console.error('Error downloading report:', error);
        throw error;
    }
};

export const GetAvaiJobs = async (pageNumber: any, pageSize: any) => {
    const response = await axiosClient.get(`${END_POINT.GET_ALL_JOBS_AVAI}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response;
};

export const GetAvaiJobsForUser = async (pageNumber: any, pageSize: any, token: string | null) => {
    const response: AxiosResponse = await axiosClient.get(`${END_POINT.GET_ALL_JOBS_AVAI_FOR_USER}?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
        headers: {
            Authorization: `${token}`,
        },
    });

    return response;
};

export const GetAvailableJobPostingsForAdmin = async (pageNumber: any, pageSize: any, token: string | null) => {
    const response: AxiosResponse = await axiosClient.get(`${END_POINT.GET_ALL_JOBS_AVAI_FOR_ADMIN}?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
        headers: {
            Authorization: `${token}`,
        },
    });

    return response;
};

export const GetSuitableJobs = async (token: string | null, pageNumber: any, pageSize: any) => {
    const response: AxiosResponse = await axiosClient.get(`${END_POINT.GET_SUITABLE_JOBS}?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
        headers: {
            Authorization: `${token}`,
        },
    });

    return response;
};

export const SearchJob = async (jobTitle: string, location: string, pageNumber: any, pageSize: any) => {
    const response: AxiosResponse = await axiosClient.get(`${END_POINT.SEARCH}?jobTitle=${jobTitle}&location=${location}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response;
};


export const GetJobPostingById = async (jobPostingId: string) => {
    const response: AxiosResponse = await axiosClient.get(`${END_POINT.GET_JOB_BY_ID}/${jobPostingId}`);

    return response;
};

export const GetPendingJobs = async (pageNumber: any, pageSize: any) => {
    const response = await axiosClient.get(`${END_POINT.GET_ALL_JOBS_PENDING}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response;
};

export const GetExpiredJobs = async (pageNumber: any, pageSize: any) => {
    const response = await axiosClient.get(`${END_POINT.GET_ALL_JOBS_EXPIRED}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response;
};

export const GetAdminLockedJobs = async (pageNumber: any, pageSize: any) => {
    const response = await axiosClient.get(`${END_POINT.GET_ALL_JOBS_ADMIN_LOCKED}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response;
};


export const GetEmLockedJobs = async (pageNumber: any, pageSize: any) => {
    const response = await axiosClient.get(`${END_POINT.GET_ALL_JOBS_EM_LOCKED}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response;
};

export const DeleteAJob = async (jobPostingId: string, token: string | null) => {
    const response: AxiosResponse = await axiosClient.delete(`${END_POINT.DELETE_A_JOB}/${jobPostingId}`, {
        headers: {
            Authorization: `${token}`,
        },
    });
    return response;
};

export const ApproveAJob = async (jobPostingId: string, token: string | null) => {
    const response: AxiosResponse = await axiosClient.put(`${END_POINT.APPROVE_A_JOB}/${jobPostingId}`, {
        headers: {
            Authorization: `${token}`,
        },
    });
    return response;
};



export const LockAJob = async (jobPostingId: string, token: string | null) => {
    const response: AxiosResponse = await axiosClient.put(`${END_POINT.LOCK_A_JOB}/${jobPostingId}`, {
        headers: {
            Authorization: `${token}`,
        },
    });
    return response;
};

export const UnlockAJob = async (jobPostingId: string, token: string | null) => {
    const response: AxiosResponse = await axiosClient.put(`${END_POINT.UNLOCK_A_JOB}/${jobPostingId}`, {
        headers: {
            Authorization: `${token}`,
        },
    });
    return response;
};

export const EditJobPosting = async (jobPostingId: string, data: any, token: string | null) => {
    const response: AxiosResponse = await axiosClient.put(`${END_POINT.GET_JOB_BY_ID}/${jobPostingId}`, data, {
        headers: {
            Authorization: `${token}`,
        },
    });
    return response;
};

