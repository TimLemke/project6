import React from 'react';
import ReactDOM from 'react-dom';
import { ajax } from 'jquery';
import firebase from './firebase.js';
const dbRef = firebase.database().ref('/users');
import { 
    BrowserRouter as Router, 
    Route, Link } from 'react-router-dom';

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			userName: '',
			temperature: '',
			userMessage: '',
			cuedPerson: [],
			cuedGifs: [],
			chosenGif: '',
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.searchGiphy = this.searchGiphy.bind(this);
		this.chosenGif = this.chosenGif.bind(this);
		this.removeCue = this.removeCue.bind(this);
	}

	/*handleSubmit(event) {
		event.preventDefault();
		const cuedPerson = Array.from(this.state.cuedPerson);
		const newPerson = {
			temperature: this.state.temperature,
			user: this.state.userName,
			userMessage: this.state.userMessage,
			chosenGif: this.state.chosenGif,
		};
		cuedPerson.push(newPerson);
		this.setState({ 
			userName: '',
			temperature: '',
			userMessage: '',
			chosenGif: '',
			cuedPerson: cuedPerson,
		});
	}*/

	handleSubmit(event) {
		event.preventDefault();
		const newPerson = {
			temperature: this.state.temperature,
			user: this.state.userName,
			userMessage: this.state.userMessage,
			chosenGif: this.state.chosenGif,
		};
		dbRef.push(newPerson);
	}

	searchGiphy(event) {
		event.preventDefault();
		console.log(this.state.giphyQuery);
		let cuedGifs = [];
		ajax({
            url: `http://api.giphy.com/v1/gifs/search?`,
            data: {
                api_key: `5ec81cbaf1b242b4a9297cbfa8db8cf1`,
                q: `${this.state.giphyQuery}`,
                limit: 15
            }
        }).then((data) => {
        	console.log(data.data);
            let giphyData = [];
        	data.data.map((item, i) => {
				giphyData.push(item.images.fixed_height.url)				
			})

	        this.setState({
					cuedGifs: giphyData
				});
        });
	}

	chosenGif(event) {
		this.setState({
			chosenGif: event.target.src
		});
	}

/*	removeCue(index) {
		const cueItems = Array.from(this.state.cuedPerson);
		cueItems.splice(index, 1);
		this.setState({
			cuedPerson: cueItems,
		})
	}*/

	removeCue(index) {
		const userRef = firebase.database().ref(`/users/${index}`);
		userRef.remove();
	}


	handleChange(event) {
		this.setState({
			[event.target.name]: event.target.value
		});
		
	}



	componentDidMount() {
		dbRef.on('value', (snapshot) => {
			const cuedPersonArray = [];
			const firebaseItems = snapshot.val();
			for (let key in firebaseItems) {
				const firebaseItem = (firebaseItems[key]);
				firebaseItem.id = key;
				cuedPersonArray.push(firebaseItem);
			}
			this.setState({
				cuedPerson: cuedPersonArray,
			});

		});
	}

	render() {
		return (
			<div className='app'>
				<header>
					<div className="wrapper headerContainer">
						{/*<img className="hackerLogo" src="../../public/assets/terminal.png" alt="HackerYou Logo"/>*/}
						<img className="microIcon" src="../../public/assets/microwave.png" alt="Microwave Icon"/>
						<h1><span>Micro</span>Cue</h1>
					</div>
				</header>
				<main>
					<div className="wrapper mainContainer">
						<section className="addUser">
								<form onSubmit={this.handleSubmit}>
									<input className="username" type="text" name="userName" placeholder="What's your name?" onChange={this.handleChange} />
									<p className="howCold">How Cold Is Your Food?</p>
									<label htmlFor="roomTemp">Room Temp.</label>
								    <input onClick={this.handleChange} type="radio" name="temperature" value="Room Temp" id="roomTemp"/>
								    <label htmlFor="cool">Cool</label>
								    <input onClick={this.handleChange} type="radio" name="temperature" value="Cool" id="cool"/>
								    <label htmlFor="cold">Cold</label>
								    <input onClick={this.handleChange} type="radio" name="temperature" value="Cold" id="cold"/>
								    <label htmlFor="thawed">Thawed</label>
								    <input onClick={this.handleChange} type="radio" name="temperature" value="Thawed" id="thawed"/>
								    <label htmlFor="frozen">Frozen</label>
								    <input onClick={this.handleChange} type="radio" name="temperature" value="Frozen" id="frozen"/>
								    <textarea className="usermessage" name="userMessage" cols="30" rows="10" placeholder="What's your message to the group?"  onChange={this.handleChange}></textarea>
							    	<input className="giphyQuery" type="text" onChange={this.handleChange} name="giphyQuery"/>
							    	<button className="gifSearchButton"onClick={this.searchGiphy}>Gif Me!</button>
									<button className="cueButton">Add Yourself to the Cue!</button>
									<div className="giphyGallery">
										{this.state.cuedGifs.map((item, i) => {
											return(
												<img onClick={this.chosenGif} className="gifImage" src={`${item}`} alt="A Gif from Giphy"/>
								  				)
										})}
									</div>
								</form>
						</section>
							<section className="cueResults">
								<ul>
									{this.state.cuedPerson.map((item, id) => {
										return(
											<li key={item.id}>
												{console.log(item.id)}
												<div className="cueItem">
													<div className="cueText">
														<h3>{item.user}</h3>
														<p>Food Temperature: {item.temperature}</p>
														<p>{item.userMessage}</p>
														<button onClick={() => this.removeCue(item.id)}>Remove Item</button>
													</div>
													<div className="cueGif">
														<img src={`${item.chosenGif}`} alt="The users selected gif"/>
													</div>
												</div>
											</li>
											)
									})}
								</ul>

							
							</section>
					</div>
				
				</main>
			</div>
			
		)
	}
}

ReactDOM.render(<App />, document.getElementById('app'));
