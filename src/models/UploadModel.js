import ApiRequest from "../utils/ApiRequest";

export default class Upload {
    static upload3dFile = async (file) => {
        let formData = new FormData();
        formData.append('upload', file, file.name);
        return await ApiRequest.setMultipart("/v1/upload/public/3dfile", "POST", formData);
    }

    static uploadPicutre = async (file) => {
        let formData = new FormData();
        formData.append('upload', file, file.name);
        return await ApiRequest.setMultipart("v1/upload/public/image", "POST", formData);
    }
    
    // static uploadFile = async (body) => {
    //     return await ApiRequest.setMultipart("v1/upload/public/file", "POST", body);
    // }

    // static uploadFileV2 = async (file) => {
    //     let formData = new FormData();
    //     formData.append('upload', file, file.name);
    //     return await ApiRequest.setMultipart("v1/upload/public/file", "POST", formData);
    // }

}
