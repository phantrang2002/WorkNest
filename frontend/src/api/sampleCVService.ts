import { AxiosResponse } from 'axios';
import axiosClient from './axiosClient';

const END_POINT = {
    SAMPLE_CV_UPLOAD: "sample-cv/upload",
    SAMPLE_CV: "sample-cv",

};
 

export const PostSampleCV = async (data: FormData, token: string | null) => {
    const response: AxiosResponse = await axiosClient.post(`${END_POINT.SAMPLE_CV_UPLOAD}`, data, {
        headers: {
            Authorization: `${token}`, // Add token to headers
            'Content-Type': 'multipart/form-data',  // Ensure the correct content type
        },
    });
    return response;
};

export const GetAllSampleCV = async (pageNumber:any, pageSize:any) => {
    const response = await axiosClient.get(`${END_POINT.SAMPLE_CV}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response;
};

export const GetAllSampleCVWithoutPage = async () => {
    const response = await axiosClient.get(`${END_POINT.SAMPLE_CV}/all`);
    return response;
};


export const DeleteASampleCV = async (sampleID: string, token: string | null) => {
    const response: AxiosResponse = await axiosClient.delete(`${END_POINT.SAMPLE_CV}/${sampleID}`, {
        headers: {
            Authorization: `${token}`, 
        },
    });
    return response;
};


export const UpdateSampleCV = async (sampleID: string, data: any, token: string | null) => {
    
    const response: AxiosResponse = await axiosClient.put(`${END_POINT.SAMPLE_CV}/${sampleID}`, data, {
        headers: {
            Authorization: `${token}`, // Add token to headers
        },
    });
    return response;
};
 