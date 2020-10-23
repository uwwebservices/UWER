import React from 'react';
import userImages from '../images/userImages';

export default class Form extends React.Component {
  constructor() {
    super();
    this.state = {
      userCount: 5,
      displayImages: [],
      allImages: userImages,
      interval: null,
      lastChanged: null
    };
  }
  componentWillUnmount() {
    clearInterval(this.state.interval);
  }
  componentDidMount() {
    let displayImages = this.randomSample(this.state.allImages, this.state.userCount);
    this.setState({ displayImages });

    let interval = setInterval(() => {
      let displayImages = this.state.displayImages;
      let found = false;
      while (!found) {
        let rand = Math.floor(Math.random() * this.state.userCount);
        let randomizedImages = this.randomSample(this.state.allImages, this.state.allImages.length - 1);
        if (displayImages.indexOf(randomizedImages[rand]) == -1 && rand != this.state.lastChanged) {
          displayImages[rand] = randomizedImages[rand];
          this.setState({ displayImages, lastChanged: rand });
          found = true;
        }
      }
    }, 1000);

    this.setState({ interval });
  }
  randomSample = (arr, num) => {
    return arr
      .map(a => [a, Math.random()])
      .sort((a, b) => {
        return a[1] < b[1] ? -1 : 1;
      })
      .slice(0, num)
      .map(a => a[0]);
  };
  render() {
    let displayImages = [];
    let key = 0;
    for (let img of this.state.displayImages) {
      displayImages.push(<img src={img} height="55px" key={key++} />);
    }
    return (
      <div className="userLoader">
        <div>{displayImages}</div>
        <div className="loadText">Loading registered members...</div>
      </div>
    );
  }
}
