import axios from 'axios';

const headers = {
	'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
}


export const get = async (route: string, params?: {[key: string]: boolean | string | number | object | undefined}) => {

	try {
		const response = await axios.get(
			route,
			{ params, headers }
		)
		return response.data
	} catch (error) {
		throw error;
	}

}

export const post = async (route: string, data?: {[key: string]: boolean | string | number | object | undefined}) => {

	try {
		const response = await axios.post(route, data, {
      headers,
    });
		return response.data
	} catch (error) {
		throw error;
	}

}


export const put = async (route: string, data?: {[key: string]: boolean | string | number | object | undefined}) => {

	try {
		const response = await axios.put(route, data, {
      headers,
    });
		return response.data
	} catch (error) {
		throw error;
	}

}

export const del = async (
  route: string,
  data?: { [key: string]: boolean | string | number | object | undefined }
) => {
  try {
    const response = await axios.delete(route, {
      data,
      headers,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};