import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/api`;

export const generatePresentation = (payload) =>
  axios.post(`${API}/presentations`, payload, { timeout: 240000 }).then((r) => r.data);

export const listPresentations = () =>
  axios.get(`${API}/presentations`).then((r) => r.data);

export const getPresentation = (id) =>
  axios.get(`${API}/presentations/${id}`).then((r) => r.data);

export const deletePresentation = (id) =>
  axios.delete(`${API}/presentations/${id}`).then((r) => r.data);
