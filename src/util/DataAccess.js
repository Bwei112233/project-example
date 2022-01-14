import axios from "axios";

/**
 * Makes an API call post
 *
 * @param {String} route
 * @param {Object} data can be null/not given
 * @return {success: Boolean, message: String} or a successful response object
 */
export async function makeAPICall(route, data) {
    // let loginAttempt = checkLoggedIn();
    // if (!loginAttempt.success) {
    //     return loginAttempt;
    // }

    // let newData = data == null ? {} : data;
    // newData.user_id = loginAttempt.user_id;
    // newData.user_token = loginAttempt.token;

    // make the api request
    let response = await requestAxios(route, data);
    return response;
}

/**
 * Requests data from a given route
 *
 * @param {String} route
 * @param {Object} data can be null/not given
 * @return {success: Boolean, message: String} or a successful response object
 */
async function requestAxios(route, data) {
    let response = await axios
        .post("http://localhost:4000/" + route, data, {
            crossdomain: true,
            crossorigin: true,
        })
        .catch((err) => {
            if (
                err.response &&
                err.response.data &&
                err.response.data.message
            ) {
                return { success: false, message: err.response.data.message };
            } else {
                return {
                    success: false,
                    message: "Failed to connect to server.",
                };
            }
        });
    return response;
}
