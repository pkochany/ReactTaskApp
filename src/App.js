import React, {useState} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import {FormLabel} from "react-bootstrap";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'
import {isExpired} from "react-jwt";


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {items: [], text: '', name: 'React'};
    }

    render() {
        const token = localStorage.getItem("JWTtoken")
        const isTokenExpired = isExpired(token);

        return (
            <div className="bg-dark h-100">
                <Container className="bg-secondary h-100">
                    <Row className="mb-2 pt-2 text-center">
                        <Col md={3}></Col>
                        <Col md={2}>
                            <a href="/listazadan"> <Button className="btn-dark">Lista zadań</Button></a>
                        </Col>
                        <Col md={2}>
                            <a href="/logowanie"> <Button className="btn-dark">Logowanie</Button></a>
                        </Col>
                        <Col md={2}>
                            <a href="/rejestracja"> <Button className="btn-dark">Rejestracja</Button></a>
                        </Col>
                    </Row>

                    <Router>
                        <Routes>
                            {isTokenExpired ?
                                (<Route path='/listazadan' element={<FormLogowanie />}/>) :
                                (<Route path='/listazadan' element={<ListaZadan/>}/>)}
                            <Route path="/logowanie" element={<FormLogowanie/>}/>
                            <Route path="/rejestracja" element={<FormRejestracja/>}/>
                        </Routes>
                    </Router>

                </Container>
            </div>
        );
    }
}

class JednoZadanie extends React.Component {
    state = {
        isChecked: false,
        czyZak: '',
        idtask: 0
    }

    handleTaskCheck() {
        if (this.state.isChecked === false) {
            fetch(`http://127.0.0.1:8000/checked/${this.state.idtask}`, {method: 'POST'} )
            .then((response) => {
                if (response.ok) {
                    this.setState({isChecked: true})
                }
            })
        } else {
            this.setState({isChecked: false})
        }
    }

    componentDidMount() {
        // sprawdź czy zaznaczone, jeżeli tak to przekreśl wiersz
        const czyZakonczone = this.props.zadanie.czyZakonczone
        const idTask = this.props.zadanie.idtask
        this.setState({isChecked: czyZakonczone, idTask: idTask})
    }

    render() {
        const zadanie = this.props.zadanie;
        return (
            <Row className={`text-center ${this.state.isChecked ? 'text-decoration-line-through' : ''}`}>
                <Col md={3}>{zadanie.idtask}</Col>
                <Col md={3}>{zadanie.iduser}</Col>
                <Col md={3}>{zadanie.tekst}</Col>
                <Col md={3}><input checked={this.state.isChecked} onChange={this.handleTaskCheck.bind(this)} type="checkbox" className={"form-check-input"}/></Col>
            </Row>
        );
    }
}


class ListaZadan extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            DataisLoaded: false,
            data: [],
        }
    }

    componentDidMount() {
        fetch("http://127.0.0.1:8000/listazadan")
            .then((response) => response.json())
            .then((res_json) => {
                this.setState({
                    items: Array.from(res_json),
                    DataisLoaded: true
                })
            })
    }

    render() {
        const {DataisLoaded, items} = this.state;
        if (!DataisLoaded) return <div>
            <h4> Proszę czekać, pobieranie danych... </h4>
        </div>;

        return (
            <Container className="mt-5">
                <Row className="mb-2">
                    <Col md={12} className="text-center"><h2>Lista zadań</h2></Col>
                </Row>


                <Row className={"text-center fw-bold"}>
                    <Col md={3}>idtask</Col>
                    <Col md={3}>iduser</Col>
                    <Col md={3}>tekst</Col>
                    <Col md={3}>czy zakończone</Col>
                </Row>

                {items.map((item) => (
                    <JednoZadanie zadanie={item} key={item.idtask}/>
                    ))
                }

            </Container>
        );
    }
}

function RejestracjaForm() {
    const [inputs, setInputs] = useState({});
    let toastTekst = "";
    const pokaToast = () => toast(toastTekst);

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}))
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const email = inputs.email
        const password = inputs.password
        fetch(`http://127.0.0.1:8000/rejestracja/${email}/${password}`, {
            method: "post",
            body: JSON.stringify(inputs)
        })
            .then((response) => response.json())
            .then((res_json) => {
                if (res_json.status === "ok") {
                    toastTekst = `Użytkownik ${res_json.email} dodany.`;
                    pokaToast();
                } else {
                    toastTekst = "Error."
                    pokaToast();
                }

            })
    }

    return (
        <form onSubmit={handleSubmit}>
            <Container className="mt-5">
                <Row className="mb-2">
                    <Col md={12} className="text-center"><h2>Rejestracja</h2></Col>
                </Row>
                <Row className="mb-2">
                    <Col md={2}></Col>
                    <Col md={9}><FormLabel><h5>Email:</h5></FormLabel></Col>
                </Row>
                <Row className="mb-2">
                    <Col md={2}></Col>
                    <Col md={9} className="mb-2"> <input name={"email"} type="email" className="form-control"
                                                         value={inputs.email || ""} onChange={handleChange} /> </Col>
                </Row>
                <Row className="mb-2">
                    <Col md={2}></Col>
                    <Col md={9}><FormLabel><h5>Hasło:</h5></FormLabel></Col>
                </Row>
                <Row className="mb-2">
                    <Col md={2}></Col>
                    <Col md={9} className="mb-2"> <input name={"password"} type="password" className="form-control"
                                                         value={inputs.password || ""} onChange={handleChange} /> </Col>
                </Row>
                <Row className={"text-center mt-5"}>
                    <div>
                        <Button className={"btn-lg btn-primary"} type={"submit"}> Zarejestruj się</Button>
                    </div>
                </Row>

                <ToastContainer />
            </Container>
        </form>
    )
}


class FormRejestracja extends React.Component {
    render() {
        return (
            <RejestracjaForm />
        );
    }
}


function LogowanieForm() {
    const [inputs, setInputs] = useState({});
    let toastTekst = "";
    const pokaToast = () => toast(toastTekst);

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}))
    }
    const handleSubmit = (event) => {
       event.preventDefault();
       const email = inputs.email
       fetch(`http://127.0.0.1:8000/auth/${email}`, {
            method: "POST"
        })
            .then((response) => response.json())
            .then((res_json) => {
                if (res_json.status === "ok") {
                    localStorage.setItem("JWTtoken", res_json.new_token)
                    toastTekst = `Zalogowano.`;
                    pokaToast();
                } else {
                    toastTekst = `error`;
                    pokaToast();
                }
            })
    }

    return (
        <form onSubmit={handleSubmit}>
            <Container className="mt-5">
                <Row className="mb-2">
                    <Col md={12} className="text-center"><h2>Logowanie</h2></Col>
                </Row>
                <Row className="mb-2">
                    <Col md={2}></Col>
                    <Col md={9}><FormLabel><h5>Email:</h5></FormLabel></Col>
                </Row>
                <Row className="mb-2">
                    <Col md={2}></Col>
                    <Col md={9} className="mb-2"> <input name={"email"} type="email" className="form-control"
                                                         value={inputs.email || ""} onChange={handleChange} /> </Col>
                </Row>
                <Row className="mb-2">
                    <Col md={2}></Col>
                    <Col md={9}><FormLabel><h5>Hasło:</h5></FormLabel></Col>
                </Row>
                <Row className="mb-2">
                    <Col md={2}></Col>
                    <Col md={9} className="mb-2"> <input name={"password"} type="password" className="form-control"
                                                         value={inputs.password || ""} onChange={handleChange} /> </Col>
                </Row>
                <Row className={"text-center mt-5"}>
                    <div>
                        <Button className={"btn-lg btn-primary"} type={"submit"}> Zaloguj się</Button>
                    </div>
                </Row>

                <ToastContainer />
            </Container>
        </form>
    )
}


class FormLogowanie extends React.Component {
    render() {
        return (
            <div>
                <Row className={"text-center text-warning"}><h3>Aby zobaczyć listę zadań musisz się zalogować.</h3></Row>
                <LogowanieForm />
            </div>

        );
    }
}


export default App;
