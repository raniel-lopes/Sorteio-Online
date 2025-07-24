import axios from "axios";

// URL base para API e arquivos estáticos
export const BASE_URL = "https://sorteio-online-production.up.railway.app";

// URL hardcoded para garantir funcionamento em produção
const api = axios.create({
    baseURL: `${BASE_URL}/api`,
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para lidar com respostas de erro
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado ou inválido
            localStorage.removeItem("token");
            localStorage.removeItem("perfil");
            localStorage.removeItem("nome");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default api;
