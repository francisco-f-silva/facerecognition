import React, { Component } from 'react';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';
import Particles from 'react-particles-js';

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

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: 'https://twoface.com.br/wp-content/uploads/2019/06/mulher-twoface-banner.png'
    }
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
      .then(
        function(response) {
          // do something with response
          console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
        },
        function(err) {
          // there was an error
          console.log('Ooooopss, error!!!');
        }
      );
  }

  render() {
    return (
      <div className="App">
          <Particles className='particles'
            params={particlesOptions}
          />
          <Navigation />
          <Logo />
          <Rank />
          <ImageLinkForm 
            onInputChange={this.onInputChange} 
            onButtonSubmit={this.onButtonSubmit} 
          />
          <FaceRecognition imageUrl={this.state.imageUrl} />
      </div>
    );
  }
}

export default App;
