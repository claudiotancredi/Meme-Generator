/**
 * Constructor for an Image object.
 * @param {number} id required
 * @param {string} url required, URL of the image
 * @param {object} cssSentencesPosition required, will be an array of strings
 */
function Image(id, url, cssSentencesPosition){
    this.id = id;
    this.url = url;
    this.cssSentencesPosition = cssSentencesPosition;
}

export default Image;