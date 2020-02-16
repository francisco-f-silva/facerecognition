import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';

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
  boxes: [],
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

  calculateFaceLocations = (data) => {
    const arrRegions = data.outputs[0].data.regions;
    const clarifaiFaces = arrRegions.map(region => region.region_info.bounding_box);
    const image = document.getElementById('inputimage');
    const width = image.width;
    const height = image.height;
    const faceLocations = clarifaiFaces.map((clarifaiFace) => {
      return {
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - (clarifaiFace.right_col * width),
        bottomRow: height - (clarifaiFace.bottom_row * height)
      };
    });
    return faceLocations;
  }

  displayFaceBoxes = (boxes) => {
    this.setState({boxes: boxes});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = (event) => {
    this.setState({imageUrl: this.state.input});
    fetch('http://localhost:3000/imageurl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input // if we use imageUrl here, it will assume the old imageUrl value
      })
    })
      .then(response => response.json())
      .then(response => this.calculateFaceLocations(response))
      .then(boxes => {
        if (boxes.length) {
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
            .catch(console.log) // catches network errors only
          ; 
        }
        this.displayFaceBoxes(boxes);
      })
      .catch(err => {
        console.log('Ooooopss, error!!! Maybe picture doesn\'t have faces.');
        this.displayFaceBoxes([]);
      })
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
                <FaceRecognition boxes={this.state.boxes} imageUrl={this.state.imageUrl} />
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
