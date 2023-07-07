export default function parseError(req: any, error: any) {
	if(req) {
		if( error.response ){
			req.error({code: error.response.status, message: error.response.data});
		} else {
			req.error({code: error.code || 500, message: error.message || error});
		}
	}
}