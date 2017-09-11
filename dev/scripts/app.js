import React from 'react';
import ReactDOM from 'react-dom';
import { ajax } from 'jquery';
import firebase, { auth, provider } from './firebase.js';
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
			user: null,
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.searchGiphy = this.searchGiphy.bind(this);
		this.chosenGif = this.chosenGif.bind(this);
		this.removeCue = this.removeCue.bind(this);
		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
	}

	login() {
		auth.signInWithPopup(provider)
			.then((result) => {
				this.setState({
					user: result.user,
				})
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
				});;
			});
	}

	logout() {
		auth.signOut()
			.then(() => {
				this.setState({
					user: null,
				});
			});

	}


	handleSubmit(event) {
		event.preventDefault();
		const newPerson = {
			temperature: this.state.temperature,
			user: this.state.user.displayName || this.state.user.email,
			userMessage: this.state.userMessage,
			chosenGif: this.state.chosenGif,
		};
		console.log('newPerson', newPerson)
		dbRef.push(newPerson);
	}

	searchGiphy(event) {
		event.preventDefault();
		let cuedGifs = [];
		ajax({
			url: `http://api.giphy.com/v1/gifs/search?`,
				data: {
				api_key: `5ec81cbaf1b242b4a9297cbfa8db8cf1`,
				q: `${this.state.giphyQuery}`,
				limit: 15
			}
		}).then((data) => {
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
		auth.onAuthStateChanged((user) => {
			if (user) {
				this.setState({
					user: user,
				});
			}
		});
	}

	render() {
		console.log('this.state.cuedPerson', this.state.cuedPerson);
		let sortedCuedPerson = this.state.cuedPerson;
		// console.log('sortedCuedPerson', s)
		return (
			<div className='app'>
				<header>
					<div className="wrapper headerContainer">
						<div className="headerLeft">
							<div className="logoContainer">
								<img className="microIcon" src="../../public/assets/microwave.png" alt="Microwave Icon"/>
								<h1><span>Micro</span>Cue</h1>
							</div>
							{this.state.user ? 
								<button className="logInButton" onClick={this.logout}>Log Out</button>                
							:
								<button className="logInButton" onClick={this.login}>Log In</button> 
							}</div>
						<div className="headerRight">
							{this.state.user ? 
								<img className="profileImage" src={this.state.user.photoURL} alt="User Photo"/>                
							:
								
								<img className="profileImage" src="../../public/assets/logo-hackeryou.svg" alt=""/>
							}

						</div>
					</div>
				</header>
				{this.state.user ?
				<main>
					{console.log(this.state.user.photoURL)}
					<div className="wrapper mainContainer">
						<section className="addUser">
							<form onSubmit={this.handleSubmit}>
								<input className="username" type="text" name="userName" placeholder="What's your name?" value={this.state.user.displayName || this.state.user.email} />
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
				:
	      	    <div className='wrapper'>
	      	      <p>Please log in to see the Cue!</p>
	      	    </div>
	      	  }
			</div>
		)
	}
}

ReactDOM.render(<App />, document.getElementById('app'));
