import { Card } from 'react-bootstrap';

function ImageText(props) {
    return(<>
        <Card.Img variant="top" src={props.meme.url}></Card.Img>
        <Card.ImgOverlay className="text-center">
            <Card.Text className={"standard-text " + props.meme.cssFontClass + " " + props.meme.cssColourClass + " " + props.meme.cssSentencesPosition[0]}>{props.meme.sentence1}</Card.Text>
            <Card.Text className={"standard-text " + props.meme.cssFontClass + " " + props.meme.cssColourClass + " " + props.meme.cssSentencesPosition[1]}>{props.meme.sentence2}</Card.Text>
            <Card.Text className={"standard-text " + props.meme.cssFontClass + " " + props.meme.cssColourClass + " " + props.meme.cssSentencesPosition[2]}>{props.meme.sentence3}</Card.Text>
        </Card.ImgOverlay>
    </>)
}

export default ImageText;