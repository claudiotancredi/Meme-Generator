/**
 * Constructor for a Meme object. The general structure differs from the fields that are in
 * the table memes of the db since other fields from other tables are also needed in the 
 * front-end
 * @param {*} id required, could be either a number or a string (for temporary memes)
 * @param {string} title required, at least 5 chars long
 * @param {string} url required, URL of the background image
 * @param {string} sentence1 required, will be a string, even if empty ""
 * @param {string} sentence2 required, will be a string, even if empty ""
 * @param {string} sentence3 required, will be a string, even if empty ""
 * @param {object} cssSentencesPosition required, will be an array of strings
 * @param {string} cssFontClass required
 * @param {string} cssColourClass required
 * @param {boolean} prot required, prot stands for protected
 * @param {string} creatorName required
 * @param {number} creatorId required, used during comparisons between the logged user and the creator of a meme
 * @param {boolean} temp optional field, default: false. Used to mark a meme as temporary so that it will be treated in a different way
 */
function Meme(id, title, url, sentence1, sentence2, sentence3, cssSentencesPosition, cssFontClass, cssColourClass, prot, creatorName, creatorId, temp=false){
    this.id=id;
    this.title=title;
    this.url=url;
    this.sentence1=sentence1;
    this.sentence2=sentence2;
    this.sentence3=sentence3;
    this.cssSentencesPosition = cssSentencesPosition;
    this.cssFontClass=cssFontClass;
    this.cssColourClass=cssColourClass;
    this.prot=prot;
    this.creatorName=creatorName;
    this.creatorId=creatorId;
    this.temp=temp;
}

export default Meme;