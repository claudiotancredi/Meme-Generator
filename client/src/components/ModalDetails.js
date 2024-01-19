//import react-bootstrap components
import { Modal, Card, Container, Row, Col } from 'react-bootstrap';
import ImageText from "./ImageText";

function Properties(props) {
    return (<p className="italic-text">
        Title: {props.meme.title}<br /><br />
        Visibility status: {props.meme.prot ? "Protected" : "Public"}<br /><br />
        Creator: {props.meme.creatorName}
    </p>)
}

function CardImage(props) {
    return (<Card>
        <Container className="card-relative" >
            <ImageText meme={props.meme}/>
        </Container>
    </Card>)
}

function ModalDetails(props) {
    return (
        <Modal show={true} onHide={() => {
            props.setModal(false);
            props.setLoading(true);
            props.setDirty(true);
        }} backdrop="static" keyboard={false} centered animation={false} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Properties of the meme</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <Row className="align-items-center">
                        <Col xs={7}>
                            <CardImage meme={props.meme} />
                        </Col>
                        <Col>
                            <Properties meme={props.meme} />
                        </Col>
                    </Row>
                </Container>
            </Modal.Body>
        </Modal>
    )
}

export default ModalDetails;