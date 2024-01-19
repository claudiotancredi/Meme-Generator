import Meme from "./Meme";
import Image from "./Image";

const url = 'http://localhost:3000';

/**
 * Function that performs an async GET request to retrieve all the memes using the proxy call to reach the API server
 * @returns Promise to be consumed with the list of memes
 */
async function loadAllMemes() {
    const response = await fetch(url + '/api/memes');
    if (response.ok) {
        const memes = await response.json();
        return memes.map(m => new Meme(m.id, m.title, url + m.url, m.sentence1, m.sentence2, 
            m.sentence3, m.cssSentencesPosition.split(","), m.cssFontClass, 
            m.cssColourClass, Boolean(m.protected), m.name, m.user))
    }
    return [];
}

/**
 * Function that will perform a POST request to the server to store a new meme.
 * @param {object} newMeme A meme object with the info of the meme to send to the server
 */
async function addNewMeme(newMeme) {
    await fetch(url + '/api/memes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: newMeme.title,
            imageId: newMeme.imageId,
            sentence1: newMeme.sentence1,
            sentence2: newMeme.sentence2,
            sentence3: newMeme.sentence3,
            cssFontClass: newMeme.cssFontClass,
            cssColourClass: newMeme.cssColourClass,
            prot: newMeme.prot
        })
    });
}

/**
 * Function that performs an async GET request to retrieve all the PUBLIC memes using the proxy call to reach the API server
 * @returns Promise to be consumed with the list of memes
 */
async function loadPublicMemes() {
    const response = await fetch(url + '/api/memes/filter=public');
    if (response.ok) {
        const pubmemes = await response.json();
        return pubmemes.map(m => new Meme(m.id, m.title, url + m.url, m.sentence1, m.sentence2, 
            m.sentence3, m.cssSentencesPosition.split(","), m.cssFontClass, 
            m.cssColourClass, Boolean(m.protected), m.name, m.user))
    }
    return [];
}

/**
 * Function that performs a DELETE request to the server to delete an existing meme with given id.
 * @param {number} idMeme Id of the meme to delete on the server
 */
async function deleteMeme(idMeme) {
    await fetch(url + '/api/memes/' + idMeme, {
        method: 'DELETE'
    });
}

/**
 * Function that performs an async GET request to retrieve all the images using the proxy call to reach the API server
 * @returns Promise to be consumed with the list of images
 */
async function loadImages() {
    const response = await fetch(url + '/api/images');
    if (response.ok) {
        const images = await response.json();
        return images.map(i => new Image(i.id, url + i.url, i.cssSentencesPosition.split(",")));
    }
    return [];
}

/**
 * Function that performs the login through a POST request to the server
 * @param {object} credentials object with username and password of the user that wants to log in 
 * @returns an object with the user name and the user id
 */
async function logIn(credentials) {
    let response = await fetch(url + '/api/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const user = await response.json();
        return { name: user.name, id: user.id };
    }
    else {
        try {
            const errDetail = await response.json();
            throw errDetail.message;
        }
        catch (err) {
            throw err;
        }
    }
}

/**
 * Function that performs the logout through a DELETE request to the server
 */
async function logOut() {
    await fetch(url + '/api/sessions/current', { method: 'DELETE' });
}

/**
 * Function that checks wheather a user is logged in or not through a GET request to the server
 * @returns an object with the user info (id, username, name)
 */
async function getUserInfo() {
    const response = await fetch(url + '/api/sessions/current');
    const userInfo = await response.json();
    if (response.ok) {
        return userInfo;
    } else {
        throw userInfo;  // an object with the error coming from the server
    }
}



const API = { logIn, logOut, getUserInfo, loadPublicMemes, deleteMeme, loadAllMemes, loadImages, addNewMeme }

export default API;