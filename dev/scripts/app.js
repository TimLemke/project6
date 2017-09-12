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
			hangerLevel: '',
			userMessage: '',
			cuedPerson: [],
			cuedGifs: [],
			chosenGif: '',
			// cuePositon: '',
			user: null,
			showGiphy: false,
			gifKey: ''
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.searchGiphy = this.searchGiphy.bind(this);
		this.chosenGif = this.chosenGif.bind(this);
		this.removeCue = this.removeCue.bind(this);
		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
		this.closeGiphy = this.closeGiphy.bind(this);
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
					cuedGifs: [],
				});
			});
	}

	handleSubmit(event) {
		event.preventDefault();
		const newPerson = {
			temperature: Number(this.state.temperature),
			hangerLevel: Number(this.state.hangerLevel),
			user: this.state.user.displayName || this.state.user.email,
			userMessage: this.state.userMessage,
			chosenGif: this.state.chosenGif,
		};

		newPerson.cuePosition = newPerson.temperature + newPerson.hangerLevel;

		// if(newPerson.temperature === "RoomTemp"){
		// 	newPerson.cuePosition = 1;
		// } 

		console.log('newPerson', newPerson)
		dbRef.push(newPerson);
	}

	searchGiphy(event) {
		event.preventDefault();
		let cuedGifs = [];
		ajax({
			url: `https://api.giphy.com/v1/gifs/search?`,
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
				cuedGifs: giphyData,
				showGiphy: true
			});
		});
	}

	chosenGif(event, key) {
		// console.log(event.target.key);
		console.log(event, key);
		// document.getElementById('gifImage highlighted').classList.remove('highlighted');

		this.setState({
			chosenGif: event.target.src,
			gifKey: key
			// <toggleAc></toggleAc>t: 'gifImage highlighted'
		});

		// if(event.target.src === this.state.chosenGif) {
			// event.target.className = 'gifImage highlighted';
		// } else {
			// event.target.className = 'gifImage';
		// }
	}

	removeCue(index) {
		const userRef = firebase.database().ref(`/users/${index}`);
		userRef.remove();
	}

	handleChange(event) {
		this.setState({
			[event.target.name]: event.target.value,
		});
		this.setState({

		})
		
	}

	closeGiphy() {
		this.setState({
			showGiphy: false
		})
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
		let sortedCuedPerson = Array.from(this.state.cuedPerson);
		sortedCuedPerson.sort(function(a, b) {
			return (a.cuePosition - b.cuePosition);
		})
		// console.log(sortedCuedPerson);
		let showGiphy = (
			<div className="giphyGalleryContainer">
				<button onClick={this.closeGiphy}>Close</button>
				<div className="giphyGallery">
					{this.state.cuedGifs.map((item, i) => {
						return(
							<img onClick={(e) => this.chosenGif(e, `giphy-${i}`)} key={`giphy-${i}`} className={this.state.gifKey === `giphy-${i}` ? 'gifImage highlighted' : 'gifImage'} src={`${item}`} alt="A Gif from Giphy"/>
								)
					})}</div>
			</div>
		)
		return (
			<div className='app'>
				{this.state.user ?
				<div className="loggedInContainer">
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
					<main>
						<div className="wrapper mainContainer">
							<section className="addUser">
								<h2>Add yourself to the cue!</h2>
								<form onSubmit={this.handleSubmit}>
									<input className="username" type="text" name="userName" placeholder="What's your name?" value={this.state.user.displayName || this.state.user.email} />
									<p className="howCold">How Cold Is Your Food?</p>
									<label htmlFor="RoomTemp">Room Temp.</label>
									<input onClick={this.handleChange} type="radio" name="temperature" value={10} id="RoomTemp"/>
									<label htmlFor="Cool">Cool</label>
									<input onClick={this.handleChange} type="radio" name="temperature" value={20} id="Cool"/>
									<label htmlFor="Cold">Cold</label>
									<input onClick={this.handleChange} type="radio" name="temperature" value={30} id="Cold"/>
									<label htmlFor="Thawed">Thawed</label>
									<input onClick={this.handleChange} type="radio" name="temperature" value={40} id="Thawed"/>
									<label htmlFor="Frozen">Frozen</label>
									<input onClick={this.handleChange} type="radio" name="temperature" value={50} id="Frozen"/>
									<p className="howLong">How fast do you eat?</p>
									<label htmlFor="Slow">Slow</label>
									<input onClick={this.handleChange} type="radio" name="hangerLevel" value={-2} id="Slow"/>
									<label htmlFor="">Beginning</label>
									<input onClick={this.handleChange} type="radio" name="hangerLevel" value={-4} id="Beginning"/>
									<label htmlFor="frozen">Moderate</label>
									<input onClick={this.handleChange} type="radio" name="hangerLevel" value={-6} id="Moderate"/>
									<label htmlFor="Warning">Warning</label>
									<input onClick={this.handleChange} type="radio" name="hangerLevel" value={-8} id="Warning"/>
									<label htmlFor="Extreme">Extreme</label>
									<input onClick={this.handleChange} type="radio" name="hangerLevel" value={-10} id="Extreme"/>
									<p className="howHangry">How hangry are you?</p>
									<label htmlFor="Low">Low</label>
									<input onClick={this.handleChange} type="radio" name="hangerLevel" value={-3} id="Low"/>
									<label htmlFor="Beginning">Beginning</label>
									<input onClick={this.handleChange} type="radio" name="hangerLevel" value={-6} id="Beginning"/>
									<label htmlFor="frozen">Moderate</label>
									<input onClick={this.handleChange} type="radio" name="hangerLevel" value={-9} id="Moderate"/>
									<label htmlFor="Warning">Warning</label>
									<input onClick={this.handleChange} type="radio" name="hangerLevel" value={-12} id="Warning"/>
									<label htmlFor="Extreme">Extreme</label>
									<input onClick={this.handleChange} type="radio" name="hangerLevel" value={-15} id="Extreme"/>
									<textarea className="usermessage" name="userMessage" cols="10" rows="10" placeholder="What's your message to the group?"  onChange={this.handleChange}></textarea>
									<input className="giphyQuery" type="text" onChange={this.handleChange} placeholder="Search for a Gif!" name="giphyQuery"/>
									<button className="gifSearchButton"onClick={this.searchGiphy}>Gif Me!</button>
									<button className="cueButton">Add Yourself to the Cue!</button>
								</form>
									{this.state.showGiphy === true ? showGiphy : null}
							</section>
							<section className="cueResults">
								<ul>
									{sortedCuedPerson.map((item, id) => {
										return(
											<li key={item.id}>
												<div className="cueItem">
													<img className="cueItemProfileImage" src={this.state.user.photoURL} alt="User Photo"/>
													<div className="cueText">
														<h3>{item.user}</h3>
														<p>Food Temperature: {item.temperature}</p>
														<p>{item.userMessage}</p>
														{item.user === this.state.user.displayName || item.user === this.state.user.email ?
														  <button onClick={() => this.removeCue(item.id)}>Remove Item</button> : null}
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
				:
				<div className="logInContainer">
					<header>
						<div className="wrapper headerLogin">
							<div className="headerLoginLeft">
								{this.state.user ? 
									<img className="profileImage" src={this.state.user.photoURL} alt="User Photo"/>                
								:
									<img className="profileImage" src="../../public/assets/logo-hackeryou.svg" alt=""/>
								}
							</div>
							<div className="headerLoginRight">
								<div className="logoContainer">
									<img className="microIcon" src="../../public/assets/microwave.png" alt="Microwave Icon"/>
									<h1><span>Micro</span>Cue</h1>
								</div>
								{this.state.user ? 
									<button className="logInButton" onClick={this.logout}>Log Out</button>                
								:
									<button className="logInButton" onClick={this.login}>Log In</button> 
								}</div>
							<div className="builtBy">
								<p>Built by <a href={'www.timlemke.ca'}>Tim Lemke</a></p>
							</div>
						</div>
					</header>
					<main className="logInMain"></main>
				</div>
	      	    
	      	  }
			</div>
		)
	}
}

ReactDOM.render(<App />, document.getElementById('app'));
