import request from './request';

// 文件上传下载API
const filesApi = {
  /**
   * 上传文件
   * @param {File} file - 要上传的文件
   * @returns {Promise} 返回包含uri的响应
   */
  uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    return request({
      url: '/files/upload',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * 获取文件下载URL
   * @param {string} filename - 文件名或URI路径
   * @returns {string} 文件下载URL
   */
  getFileUrl(filename) {
    if (!filename) {
      return null;
    }
    
    // 如果filename已经是完整URL，直接返回
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    
    // 如果filename是URI路径（如 /files/download/xxx），直接使用
    if (filename.startsWith('/')) {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      // 如果baseURL以/结尾，去掉末尾的/
      const cleanBaseURL = baseURL.replace(/\/$/, '');
      return `${cleanBaseURL}${filename}`;
    }
    
    // 如果只是文件名，构建完整路径
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const cleanBaseURL = baseURL.replace(/\/$/, '');
    return `${cleanBaseURL}/files/download/${filename}`;
  },

  /**
   * 下载文件（返回blob）
   * @param {string} filename - 文件名或URI
   * @returns {Promise} 返回文件blob
   */
  downloadFile(filename) {
    const fileUrl = this.getFileUrl(filename);
    if (!fileUrl) {
      return Promise.reject(new Error('文件名不能为空'));
    }

    return request({
      url: fileUrl,
      method: 'get',
      responseType: 'blob',
    });
  },
};

export default filesApi;

