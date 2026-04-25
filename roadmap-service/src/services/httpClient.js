import axios from 'axios';

const RETRIES = Number.parseInt(process.env.SERVICE_RETRY_ATTEMPTS || '2', 10);
const BASE_DELAY = Number.parseInt(process.env.SERVICE_RETRY_DELAY_MS || '300', 10);
const TIMEOUT = Number.parseInt(process.env.SERVICE_TIMEOUT_MS || '15000', 10);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) => {
  const status = error?.response?.status;
  return ['ECONNRESET', 'ECONNABORTED', 'ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND'].includes(error?.code) || [502, 503, 504].includes(status);
};

export const postWithRetry = async (url, data, config = {}) => {
  let lastError = null;

  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    try {
      const response = await axios.post(url, data, {
        timeout: config.timeout || TIMEOUT,
        headers: config.headers || {},
        validateStatus: () => true
      });
      return response;
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error) || attempt === RETRIES) {
        throw error;
      }
      await sleep(BASE_DELAY * (attempt + 1));
    }
  }

  throw lastError;
};

export const getWithRetry = async (url, config = {}) => {
  let lastError = null;

  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    try {
      const response = await axios.get(url, {
        timeout: config.timeout || TIMEOUT,
        headers: config.headers || {},
        validateStatus: () => true
      });
      return response;
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error) || attempt === RETRIES) {
        throw error;
      }
      await sleep(BASE_DELAY * (attempt + 1));
    }
  }

  throw lastError;
};
