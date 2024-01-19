//import react-bootstrap components
import { Button, Modal, Card, Container, Row, Col, Form, Spinner } from 'react-bootstrap';
//imports needed to use state
import React, { useState, useEffect } from 'react';
import API from '../API';
import Image from '../Image';
import Meme from '../Meme';

function SentenceField(props) {
    return (<Form.Row>
        <Form.Group as={Col} xs="12" controlId={"sentence" + props.id}>
            <Form.Label>Sentence {props.id}</Form.Label>
            <Form.Control className="text-area-resize" placeholder="Write here..." as="textarea" rows={2} value={props.sentence}
                onChange={(event) => props.setSentence(event.target.value)} isInvalid={props.invalidSentencesFlag} />
            {props.emptySentencesErrorMessage}
        </Form.Group>
    </Form.Row>)
}

function MemeForm(props) {
    let tempId = 1;
    //Flag used to set isInvalid on title Form.Control so that special style is applied
    let invalidTitleFlag = ((props.validated === true && props.emptyTitle === true) || (props.validated === true && props.emptyTitle === false && props.longTitle === false));

    //Form.Control.Feedback error messages for title. They're shown only when conditions are met
    let emptyTitleErrorMessage = (props.validated === true && props.emptyTitle === true) ?
        (<Form.Control.Feedback type="invalid">Please provide a title for the Meme.</Form.Control.Feedback>) : "";
    let shortTitleErrorMessage = (props.validated === true && props.emptyTitle === false && props.longTitle === false) ?
        (<Form.Control.Feedback type="invalid">The title must be at least 5 characters long.</Form.Control.Feedback>) : "";

    //Flag used to set isInvalid on sentenceX Form.Control so that special style is applied
    let invalidSentencesFlag = ((props.validated === true && props.oneSentenceSetted === false));

    //Form.Control.Feedback error messages for sentences. They're shown only when conditions are met
    let emptySentencesErrorMessage = (props.validated === true && props.oneSentenceSetted === false) ?
        (<Form.Control.Feedback type="invalid">At least one sentence is required.</Form.Control.Feedback>) : "";

    return (<>
        <Form>
            <p className="italic-text">
                Customize the meme
            </p>
            <Form.Row>
                <Form.Group as={Col} xs="12" controlId="titleForm">
                    <Form.Label>Title</Form.Label>
                    <Form.Control type="text" placeholder="Write here..." value={props.title}
                        onChange={(event) => props.setTitle(event.target.value)} isInvalid={invalidTitleFlag} />
                    {emptyTitleErrorMessage}
                    {shortTitleErrorMessage}
                </Form.Group>
            </Form.Row>
            {props.loadingImages ? <div className="text-center"><Spinner animation="border" variant="primary" /> </div> : (<>
                {props.image.cssSentencesPosition[0] !== "" && <SentenceField id={tempId++} sentence={props.sentence1} setSentence={props.setSentence1} invalidSentencesFlag={invalidSentencesFlag} emptySentencesErrorMessage={emptySentencesErrorMessage} />}
                {props.image.cssSentencesPosition[1] !== "" && <SentenceField id={tempId++} sentence={props.sentence2} setSentence={props.setSentence2} invalidSentencesFlag={invalidSentencesFlag} emptySentencesErrorMessage={emptySentencesErrorMessage} />}
                {props.image.cssSentencesPosition[2] !== "" && <SentenceField id={tempId++} sentence={props.sentence3} setSentence={props.setSentence3} invalidSentencesFlag={invalidSentencesFlag} emptySentencesErrorMessage={emptySentencesErrorMessage} />}
            </>)}
            <Form.Row>
                <Form.Group as={Col} xs="5" controlId="fontForm">
                    <Form.Label>Set font</Form.Label>
                    <Form.Control className={"font-" + props.font.toLowerCase()} as="select" value={props.font} onChange={(event) => props.setFont(event.target.value)}>
                        <option className="font-bangers">Bangers</option>
                        <option className="font-bitter">Bitter</option>
                    </Form.Control>
                </Form.Group>
                <Form.Group as={Col} xs="7" controlId="colorForm">
                    <Form.Label>Set color</Form.Label>
                    <Container>
                        <Button className="color-button color-button-black" active={props.color === "Black"} onClick={() => props.setColor("Black")}></Button>
                        <Button className="color-button color-button-white" active={props.color === "White"} onClick={() => props.setColor("White")}></Button>
                        <Button className="color-button color-button-red" active={props.color === "Red"} onClick={() => props.setColor("Red")}></Button>
                        <Button className="color-button color-button-green" active={props.color === "Green"} onClick={() => props.setColor("Green")}></Button>
                    </Container>
                </Form.Group>
            </Form.Row>
            <Form.Row>
                <Form.Group as={Col} xs="12" controlId="visibilityForm">
                    <Form.Label>Set visibility status</Form.Label>
                    <Form.Control as="select" value={props.visibilityStatus} onChange={(event) => props.setVisibilityStatus(event.target.value)} disabled={props.visibilityConstraint === true}>
                        <option >Protected</option>
                        <option>Public</option>
                    </Form.Control>
                </Form.Group>
            </Form.Row>
        </Form>
    </>)
}

function ModalCreate(props) {
    const modalTitle = (props.meme.title === "" ? "New meme" : "Copy meme");
    let tempIdButton = 1;

    const [currentImage, setCurrentImage] = useState(undefined);
    const [title, setTitle] = useState(props.meme.title);
    const [font, setFont] = useState(props.meme.font);
    const [color, setColor] = useState(props.meme.color);
    const [sentence1, setSentence1] = useState(props.meme.sentence1);
    const [sentence2, setSentence2] = useState(props.meme.sentence2);
    const [sentence3, setSentence3] = useState(props.meme.sentence3);
    const [visibilityStatus, setVisibilityStatus] = useState(props.meme.prot);

    const [emptyTitle, setEmptyTitle] = useState(true);
    const [longTitle, setLongTitle] = useState(false);
    const [oneSentenceSetted, setOneSentenceSetted] = useState(false);
    //validated : becomes true after the first submit so that error messages are shown
    const [validated, setValidated] = useState(false);
    const [imageList, setImageList] = useState([]);
    const [loadingImages, setLoadingImages] = useState(true);

    const memeUrl = props.meme.url;

    const resetStates = (image) => {
        setTitle("");
        setFont("Bangers");
        setColor("Black");
        setSentence1("");
        setSentence2("");
        setSentence3("");
        setVisibilityStatus("Protected");
        setEmptyTitle(true);
        setLongTitle(false);
        setOneSentenceSetted(false);
        setValidated(false);
        setCurrentImage(image);
    }

    useEffect(() => {
        const getImages = () => {
            API.loadImages().then(newImageList => {
                newImageList = newImageList.map(i => new Image(i.id, i.url, i.cssSentencesPosition));
                setImageList(newImageList);
                setCurrentImage(newImageList.filter(element => element.url === memeUrl)[0]);
            }).catch(() => setImageList([])).finally(() => {
                setLoadingImages(false);
            })
        }
        getImages();
        return () => {
            setImageList([]);
            setCurrentImage(undefined);
            setLoadingImages(true);
        }
    }, [memeUrl]);

    const addMeme = (newMemeForServer, newMemeForList) => {
        props.setMemesList((oldList) => oldList.concat(newMemeForList));
        API.addNewMeme(newMemeForServer).then(() => props.setDirty(true));
    }

    const addMemeThenCloseModal = () => {
        const newMemeForServer = { title: title, imageId: currentImage.id, sentence1: sentence1, sentence2: sentence2, sentence3: sentence3, cssFontClass: "font-" + font.toLowerCase(), cssColourClass: "color-" + color.toLowerCase(), prot: visibilityStatus === "Protected" };
        const newMemeForList = new Meme(`meme${props.tempMemeId}`, title, currentImage.url, sentence1, sentence2, sentence3, currentImage.cssSentencesPosition, "font-" + font.toLowerCase(), "color-" + color.toLowerCase(), visibilityStatus === "Protected", props.username, props.userId, true);
        props.setTempMemeId((id) => id + 1);
        addMeme(newMemeForServer, newMemeForList);
        props.setModal(false);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        //Check if the form is valid, if so add the meme and close the modal
        if (title.length >= 5 && (sentence1 !== "" || sentence2 !== "" || sentence3 !== "")) {
            addMemeThenCloseModal();
        }
        else {
            // Form is not valid, but perform validation and update states accordingly so that messages are shown on the form
            if (title.length === 0) {
                setEmptyTitle(true);
                setLongTitle(false);
            }
            else if (title.length < 5 && title.length > 0) {
                setEmptyTitle(false);
                setLongTitle(false);
            }
            else {
                setEmptyTitle(false);
                setLongTitle(true);
            }
            if (sentence1 === "" && sentence2 === "" && sentence3 === "") {
                setOneSentenceSetted(false);
            }
            else {
                setOneSentenceSetted(true);
            }
            //From the first time that the user clicks on the Save button the validated state is set to true
            setValidated(true);
        }
    };

    return (
        <Modal show={true} onHide={() => {
            props.setModal(false);
            props.setLoading(true);
            props.setDirty(true);
        }} backdrop="static" keyboard={false} centered animation={false} size={props.meme.title === "" ? "xl" : "lg"}>
            <Modal.Header closeButton>
                <Modal.Title>{modalTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <Row className="align-items-center">
                        {modalTitle === "New meme" && <Col xs={3} className="card-relative">
                            <Row>
                                <p className="italic-text">Choose a background image for the meme</p>
                            </Row>
                            {loadingImages ? <div className="text-center"><Spinner animation="border" variant="primary" /> </div> : <div className="custom-previews">
                                {imageList.map((i) => (<Button key={tempIdButton++} width={200} height={200} variant="link outline-light" as="img" src={i.url} onClick={() => {
                                    resetStates(i);
                                }} />))}
                            </div>}
                        </Col>
                        }
                        <Col>
                            <Row>
                                <Col>
                                    <p className="italic-text">
                                        Preview
                                    </p>
                                </Col>
                            </Row>
                            {loadingImages ? <div className="text-center"><Spinner animation="border" variant="primary" /> </div> : <Card>
                                <Container className="card-relative" >
                                    <Card.Img variant="top" src={currentImage.url}></Card.Img>
                                    <Card.ImgOverlay className="text-center">
                                        <Card.Text className={"standard-text font-" + font.toLowerCase() + " color-" + color.toLowerCase() + " " + currentImage.cssSentencesPosition[0]}>{sentence1}</Card.Text>
                                        <Card.Text className={"standard-text font-" + font.toLowerCase() + " color-" + color.toLowerCase() + " " + currentImage.cssSentencesPosition[1]}>{sentence2}</Card.Text>
                                        <Card.Text className={"standard-text font-" + font.toLowerCase() + " color-" + color.toLowerCase() + " " + currentImage.cssSentencesPosition[2]}>{sentence3}</Card.Text>
                                    </Card.ImgOverlay>
                                </Container>
                            </Card>}
                        </Col>
                        <Col xs={props.meme.title === "" ? 3 : 5}>
                            <MemeForm loadingImages={loadingImages} visibilityConstraint={props.meme.visibilityConstraint} image={currentImage} title={title} setTitle={setTitle} font={font} setFont={setFont} color={color} setColor={setColor} sentence1={sentence1} setSentence1={setSentence1}
                                sentence2={sentence2} setSentence2={setSentence2} sentence3={sentence3} setSentence3={setSentence3} visibilityStatus={visibilityStatus} setVisibilityStatus={setVisibilityStatus}
                                validated={validated} emptyTitle={emptyTitle} longTitle={longTitle} oneSentenceSetted={oneSentenceSetted} />
                        </Col>
                    </Row>
                </Container>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => {
                    props.setModal(false);
                    props.setLoading(true);
                    props.setDirty(true);
                }}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loadingImages}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ModalCreate;