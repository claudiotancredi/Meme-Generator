function cssForHashLoader() {
    const override = `
    margin       : 0;
    position     : absolute;
    top          : 50%;
    left         : 50%;
    -ms-transform: translate(-50%, -50%);
    transform    : translate(-50%, -50%);
  `;
    return override;
}

const primaryColor = "#007bff";
const hashLoaderSize = 150;

const fontMapping = {
    "font-bitter": "Bitter",
    "font-bangers": "Bangers"
}
const colorMapping = {
    "color-red": "Red",
    "color-white": "White",
    "color-black": "Black",
    "color-green": "Green"
}

//Define a function to get a predefined meme object used at modal opening for meme creation
function emptyMeme(username){
    return ({
        title: "",
        url: "http://localhost:3000/static/old.png",
        sentence1: "",
        sentence2: "",
        sentence3: "",
        cssSentencesPosition: ["bottom-single-text", "", ""],
        font: "Bangers",
        color: "Black",
        prot: "Protected",
        creatorName: username
    })
}

const UTILS = { cssForHashLoader, primaryColor, hashLoaderSize, fontMapping, colorMapping, emptyMeme };
export default UTILS;