import { AxiosResponse } from 'axios';
import axiosClient from './axiosClient';

const END_POINT = {
    POLICY: "policy",

};

export const PostPolicy = async (data: FormData, token: string | null) => {
    const response: AxiosResponse = await axiosClient.post(`${END_POINT.POLICY}`, data, {
        headers: {
            Authorization: `${token}`, // Add token to headers 
        },
    });
    return response;
};

export const GetAllPolicy = async (pageNumber:any, pageSize:any) => {
    const response = await axiosClient.get(`${END_POINT.POLICY}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response;
};

export const DeleteAPolicy  = async (policyId: string, token: string | null) => {
    const response: AxiosResponse = await axiosClient.delete(`${END_POINT.POLICY}/${policyId}`, {
        headers: {
            Authorization: `${token}`, 
        },
    });
    return response;
};


export const GetPolicy = async () => {
    const response = await axiosClient.get(`${END_POINT.POLICY}/all`);
    return response;
};



export const UpdatePolicy = async (policyId: string, data: any, token: string | null) => {
    
    const response: AxiosResponse = await axiosClient.put(`${END_POINT.POLICY}/${policyId}`, data, {
        headers: {
            Authorization: `${token}`, // Add token to headers
        },
    });
    return response;
};
 
