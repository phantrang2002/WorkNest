import { AxiosResponse } from 'axios';
import axiosClient from './axiosClient';

const END_POINT = {
    PROFILE: "candidate/profile",
    UPLOAD_AVATAR: "candidate/upload-avatar",
    CANDIDATE: "candidate",
    GET_AVAI_CAN: "candidate/available",
    GET_LOCKED_CAN: "candidate/locked",
    LOCK_A_CANDIDATE: "candidate/lock",
    UNLOCK_A_CANDIDATE: "candidate/unlock"

};

export const GetMyProfile = async (token: string | null) => {
    const response: AxiosResponse = await axiosClient.get(`${END_POINT.PROFILE}`, {
        headers: {
            Authorization: `${token}`,
        },
    });
    return response;
};

export const GetCandidate = async (candidateId: string | string[]) => {
    const response: AxiosResponse = await axiosClient.get(`${END_POINT.CANDIDATE}/${candidateId}`);
    return response;
};

export const UploadAvatarProfile = async (token: string | null, avatarFile: File) => {
    const formData = new FormData();

    if (avatarFile) {
        formData.append('file', avatarFile);
    } else {
        throw new Error("No file provided.");
    }

    const response: AxiosResponse = await axiosClient.post(`${END_POINT.UPLOAD_AVATAR}`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response;
};

export const EditMyProfile = async (token: string | null, profileData: FormData): Promise<AxiosResponse> => {
    if (!token) {
        throw new Error("No token provided");
    }

    try {
        const response: AxiosResponse = await axiosClient.put(`${END_POINT.PROFILE}`, profileData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};
export const GetAvaiCandidate = async (pageNumber: any, pageSize: any) => {
    const response = await axiosClient.get(`${END_POINT.GET_AVAI_CAN}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response;
};

export const GetLockedCandidate = async (pageNumber: any, pageSize: any) => {
    const response = await axiosClient.get(`${END_POINT.GET_LOCKED_CAN}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response;
};

export const LockACandidate = async (candidateId: string, token: string | null) => {
    const response: AxiosResponse = await axiosClient.put(`${END_POINT.LOCK_A_CANDIDATE}/${candidateId}`, {
        headers: {
            Authorization: `${token}`,
        },
    });
    return response;
};

export const UnlockACandidate = async (candidateId: string, token: string | null) => {
    const response: AxiosResponse = await axiosClient.put(`${END_POINT.UNLOCK_A_CANDIDATE}/${candidateId}`, {
        headers: {
            Authorization: `${token}`,
        },
    });
    return response;
};


