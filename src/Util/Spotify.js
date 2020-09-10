const appClientId = 'ed51599a8a094243aa0be1af4a6a170f'
const redirectURI = "http://localhost:3000/"

let userAccessToken;

const Spotify = {
    getAccessToken() {
        if(userAccessToken) {
            return userAccessToken
        }
        //Looking for access tokens and expires date
        let accessTokenMatch = window.location.href.match(/access_token=([^&]*)/)
        let expireDateMatch = window.location.href.match(/expires_in=([^&]*)/)

        if(accessTokenMatch && expireDateMatch) {
            userAccessToken = accessTokenMatch
            let expiresIn = Number(expireDateMatch[1])
            //Clearing new parameter in URL when token expires 
            window.setTimeout(() => userAccessToken = '', expiresIn * 1000)
            window.history.pushState('Access Token', null, '/')
            return userAccessToken
        } else {
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${appClientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`
            window.location = accessUrl;
        }
    },
    search(term) {

    }
}

export default Spotify