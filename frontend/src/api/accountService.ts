import { AxiosResponse } from 'axios';
import axiosClient from './axiosClient';

const END_POINT = {
    REGISTER: "account/register",
    LOGIN: "account/login",
    HOME: "account",
    COUNTS: "account/counts",
    REPORT: "account/report",
    FORGOT_PASSWORD: "account/forgot-password",
    RESET_PASSWORD: "account/reset-password",
    CHANGE_PASSWORD: "account/change-password",

};

export const login = async (data: any) => {
    const response = await axiosClient.post(`${END_POINT.LOGIN}`, data);
    return response;
}

export const forgotPassword = async (data: any) => {
    const response = await axiosClient.post(`${END_POINT.FORGOT_PASSWORD}`, data);
    return response;
}

export const resetPassword = async (data: any) => {
    const response = await axiosClient.post(`${END_POINT.RESET_PASSWORD}`, data);
    return response;
}

export const changePassword = async (data: any, token: string | null) => {
    const response = await axiosClient.post(`${END_POINT.CHANGE_PASSWORD}`, data, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });
    return response;
}

export const register = async (data: any) => {
    const response = await axiosClient.post(`${END_POINT.REGISTER}`, data);
    return response;
}


export const home = async () => {
    const response = await axiosClient.get(`${END_POINT.HOME}`);
    return response;
};


export const counts = async () => {
    const response = await axiosClient.get(`${END_POINT.COUNTS}`);
    return response;
};

export const GetReport = async () => {
    const response = await axiosClient.get(`${END_POINT.REPORT}`);
    return response;
}; 