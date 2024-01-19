import { Card, CardColumns, Button, Image, Container, Row, Col, Spinner } from 'react-bootstrap';
//import images
import lock from "../myicons/lock.png";
import memes from "../myicons/memes.gif";
import API from '../API';
import ModalDetails from './ModalDetails';
import ModalCreate from './ModalCreate';
import ImageText from './ImageText';
//imports needed to use state
import React, { useState } from 'react';
import Meme from "../Meme";
import UTILS from "../Utils";

function TitleLockSpinner(props) {
    return (<>
        <Col xs={!props.meme.temp && !props.meme.prot ? 12 : 12 - Number(props.meme.temp) - Number(props.meme.prot)}>
            <Card.Title >{props.meme.title}</Card.Title>
        </Col>

        {props.meme.prot && <Col xs={1}>
            <Image src={lock} width={22} height={22} />
        </Col>}

        {props.meme.temp && <Col xs={1}>
            <Spinner animation="border" variant="primary" />
        </Col>}
    </>)
}

function MemeCard(props) {

    //Callback that receives an edited version of the meme (with temp true) and performs an API call to delete it from the server
    const deleteMeme = (editedMeme) => {
        props.setMemesList((oldList) => {
            //Starting from the oldList check each meme, if it matches the one that we're deleting then
            //replace it with the edited version and return it
            const list = oldList.map((meme) => {
                if (meme.id === editedMeme.id) {
                    return editedMeme;
                }
                else {
                    return meme;
                }
            });
            return list;
        });
        API.deleteMeme(editedMeme.id).then(() => props.setDirty(true));
    }

    return (
        <Card border={props.meme.temp ? "primary" : ""}>
            <Card.Body>
                <Container>
                    <Row>
                        <TitleLockSpinner meme={props.meme} />
                    </Row>
                </Container>
            </Card.Body>

            <Container onClick={props.meme.temp ? null : () => {
                props.setModalDetailsMeme(props.meme);
                //Set modal to true to create and open the modal for details
                props.setModal(true);
            }} className="card-relative clickable" >
                <ImageText meme={props.meme} />
            </Container>

            {props.loggedIn && <Card.Footer className="d-flex w-100 justify-content-between">
                <Button size="md" variant="primary" onClick={props.meme.temp ? null : () => {
                    props.setModalCreateMeme({
                        title: props.meme.title,
                        url: props.meme.url,
                        sentence1: props.meme.sentence1,
                        sentence2: props.meme.sentence2,
                        sentence3: props.meme.sentence3,
                        cssSentencesPosition: props.meme.cssSentencesPosition,
                        font: UTILS.fontMapping[props.meme.cssFontClass],
                        color: UTILS.colorMapping[props.meme.cssColourClass],
                        prot: props.meme.prot ? "Protected" : "Public",
                        creatorName: props.username,
                        visibilityConstraint: props.userId !== props.meme.creatorId && props.meme.prot === true
                    })
                    props.setModalCreate(true);
                }} disabled={props.meme.temp}>Copy meme</Button>

                <Button size="md" variant="primary" onClick={props.meme.temp ? null : () => {
                    let editedMeme = new Meme(props.meme.id, props.meme.title, props.meme.url, props.meme.sentence1, props.meme.sentence2, props.meme.sentence3, props.meme.cssSentencesPosition, props.meme.cssFontClass, props.meme.cssColourClass, props.meme.prot, props.meme.creatorName, props.meme.creatorId, true);
                    deleteMeme(editedMeme);
                }} disabled={(props.userId !== props.meme.creatorId) || props.meme.temp}>Delete meme</Button>
            </Card.Footer>}
        </Card>)
}

function MainContent(props) {
    //Define a boolean state to decide when to open the modal with the details
    const [modalDetails, setModalDetails] = useState(false);
    //Define a state to contain the information of the meme to pass to the modal with the details
    const [modalDetailsMeme, setModalDetailsMeme] = useState(undefined);
    //Define a boolean state to decide when to open the modal for the creation of a meme
    const [modalCreate, setModalCreate] = useState(false);
    //Define a state to contain the information of the meme to pass to the modal for the creation of a meme
    const [modalCreateMeme, setModalCreateMeme] = useState(undefined);

    //Define a state for ids of TEMPORARY memes. It will be used like a counter to get a new id every time it is necessary
    const [tempMemeId, setTempMemeId] = useState(1);

    return (
        <>
            {props.memes.length === 0 ? <Image className="center" src={memes} /> : <>
                <CardColumns>
                    {props.memes.map((m) => (<MemeCard key={m.id} userId={props.userId} setModalCreate={setModalCreate} setModalCreateMeme={setModalCreateMeme} setModal={setModalDetails} setModalDetailsMeme={setModalDetailsMeme} username={props.username} loggedIn={props.loggedIn} meme={m} setMemesList={props.setMemesList} setDirty={props.setDirty} />))}
                </CardColumns>
                {modalDetails && (<ModalDetails setLoading={props.setLoading} setDirty={props.setDirty} meme={modalDetailsMeme} setModal={setModalDetails} />)}
            </>}
            {modalCreate && (<ModalCreate setLoading={props.setLoading} tempMemeId={tempMemeId} setTempMemeId={setTempMemeId} setMemesList={props.setMemesList} meme={modalCreateMeme} images={props.images} setModal={setModalCreate} username={props.username} userId={props.userId} setDirty={props.setDirty} />)}
            {props.loggedIn && <Button type="button" variant="primary" size="lg" className="fixed-right-bottom" onClick={() => {
                //Add button
                //Update the ModalCreateMeme state with an empty meme that will be passed to the modal for the creation of a meme
                setModalCreateMeme(UTILS.emptyMeme(props.username));
                //Set modal to true to create and open the modal
                setModalCreate(true);
            }}>+</Button>}
        </>
    )
}

export default MainContent;