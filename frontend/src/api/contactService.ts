

import { AxiosResponse } from 'axios';
import axiosClient from './axiosClient';

const END_POINT = {
    RESOLVED_CONTACT: "contact/resolved",
    UN_RESOLVED_CONTACT: "contact/unresolved",
    RESOLVE_CONTACT: "contact/resolve",
    POST_CONTACT: "contact/create",


}; 

export const GetResolvedContact = async (pageNumber:any, pageSize:any) => {
    const response = await axiosClient.get(`${END_POINT.RESOLVED_CONTACT}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response;
};
 
export const GetUnResolvedContact = async (pageNumber:any, pageSize:any) => {
    const response = await axiosClient.get(`${END_POINT.UN_RESOLVED_CONTACT}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response;
};

export const resolveContact = async (contactID: string, title: string, description: string, token: string | null) => {
    const data = {
        contactID,
        title,
        description,
    };

    const response: AxiosResponse = await axiosClient.post(`${END_POINT.RESOLVE_CONTACT}`, data, {
        headers: {
            Authorization: `${token}`, // Add token to headers
        },
    });
    return response; 
};
 
export const PostContact = async (data: FormData, token: string | null) => {
    const response: AxiosResponse = await axiosClient.post(`${END_POINT.POST_CONTACT}`, data, {
        headers: {
            Authorization: `${token}`, // Add token to headers 
        },
    });
    return response;
};
