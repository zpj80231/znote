export const httpGet = async (url) => {
    return fetch(url)
        .then((response) => {
            return response.json();
        })
}