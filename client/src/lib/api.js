import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

const stripJsonContentType = {
  transformRequest: [
    (data, headers) => {
      delete headers["Content-Type"];
      return data;
    },
  ],
};

export function postForm(url, formData) {
  return api.post(url, formData, stripJsonContentType);
}

export function patchForm(url, formData) {
  return api.patch(url, formData, stripJsonContentType);
}
