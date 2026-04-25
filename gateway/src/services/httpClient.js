import axios from 'axios';

const DEFAULT_RETRIES = Number.parseInt(process.env.GATEWAY_RETRY_ATTEMPTS || '2', 10);
const DEFAULT_DELAY_MS = Number.parseInt(process.env.GATEWAY_RETRY_DELAY_MS || '300', 10);
const DEFAULT_TIMEOUT_MS = Number.parseInt(process.env.GATEWAY_TIMEOUT_MS || '30000', 10);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) => {
  const status = error?.response?.status;
  const code = error?.code;
  return (
    code === 'ECONNRESET' ||
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
};

const isRetryableStatus = (status, retryStatuses = [502, 503, 504]) => retryStatuses.includes(status);

export const requestWithRetry = async ({ method, url, data, headers, timeout = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES, retryStatuses = [502, 503, 504] }) => {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await axios({
        method,
        url,
        data,
        headers,
        timeout,
        validateStatus: () => true
      });

      if (isRetryableStatus(response.status, retryStatuses) && attempt < retries) {
        await sleep(DEFAULT_DELAY_MS * (attempt + 1));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error) || attempt === retries) {
        throw error;
      }
      await sleep(DEFAULT_DELAY_MS * (attempt + 1));
    }
  }

  throw lastError;
};

export const isRetryable = isRetryableError;
