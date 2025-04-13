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