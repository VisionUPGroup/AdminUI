import { Container, Row } from "reactstrap";
import LoginTabs from "./LoginTabsDummy";


const DummyLogin = () => {
  return (
    <div className="page-wrapper">
      <div className="authentication-box">
        <Container>
          <Row>
         
            <LoginTabs />
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default DummyLogin;
