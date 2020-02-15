import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';

const app = new Clarifai.App({
 apiKey: '39c7f5269c8f40d38ab3a96dc546d3a7'
});

const particlesOptions = {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 600
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',  //possible values: signin, register, home, signout
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }});
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = image.width;
    const height = image.height;
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    };
  }

  displayFaceBox = (box) => {
    //console.log(box);
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = (event) => {
    this.setState({imageUrl: this.state.input});
    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL, 
        this.state.input) // if we use imageUrl here, it will assume the old imageUrl value
      .then(response => this.calculateFaceLocation(response))
      .then(box => {
        if (box) {
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, {entries: count})); // if we used setState({user: {entries: count}}), it would update all attributes of user
            })
          ; 
        }
        this.displayFaceBox(box);
      })
      .catch(err => console.log('Ooooopss, error!!!'))
    ;
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState); // clears whole state
    } else {
      if (route === 'home') {
        this.setState({isSignedIn: true});
      }
      this.setState({route: route});
    }
  }

  render() {
    return (
      <div className="App">
          <Particles className='particles'
            params={particlesOptions}
          />
          <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} />
          { this.state.route === 'home'
            ? <div>
                <Logo />
                <Rank name={this.state.user.name} entries={this.state.user.entries} />
                <ImageLinkForm 
                  onInputChange={this.onInputChange} 
                  onButtonSubmit={this.onButtonSubmit} 
                />
                <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
              </div>
            : (
                this.state.route === 'register'
                  ? <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
                  : <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              )
          }
      </div>
    );
  }
}

export default App;
