const appClientId = 'ed51599a8a094243aa0be1af4a6a170f'
const redirectURI = "http://brawny-soap.surge.sh"

let userAccessToken;

const Spotify = {
    getAccessToken() {
        if(userAccessToken) {
            return userAccessToken
        }
        //Looking for access tokens and expires date
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/)
        const expireDateMatch = window.location.href.match(/expires_in=([^&]*)/)

        if(accessTokenMatch && expireDateMatch) {
            userAccessToken = accessTokenMatch[1]
            let expiresIn = Number(expireDateMatch[1])
            //Clearing new parameter in URL when token expires 
            window.setTimeout(() => userAccessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return userAccessToken
        } else {
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${appClientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`
            window.location = accessUrl;
        }
    },
    search(term) {
        const accesToken = Spotify.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, 
        { headers: {
            Authorization: `Bearer ${accesToken}`
        }})
        .then(response => {
            return response.json()
        })
        .then(jsonResponse => {
            if(!jsonResponse.tracks) {
                return []
            }
            return jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
            }))
        })
    },
    savePLaylist(playListName, trackUriArray) {
        if(!playListName || !trackUriArray) {
            return
        }

        let accessToken = Spotify.getAccessToken()
        let headers = {Authorization: `Bearer ${accessToken}`}
        let userId;

        return fetch('https://api.spotify.com/v1/me', {headers: headers}
        ).then(response => response.json()
        ).then(jsonResponse => {
            userId = jsonResponse.id
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, 
            {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({ name: playListName})
            })
            .then(response => response.json())
            .then(jsonResponse => {
                const playlistId = jsonResponse.id
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
                {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({
                        uris: trackUriArray
                    })
                })
            })
        })
    }
}

export default Spotify