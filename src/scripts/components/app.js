'use strict';

var React = require('react/addons');

var iWantHue = require('iwanthue-api');
var ReactSlider = require('react-slider');

// CSS
require('../../styles/normalize.css');
require('../../styles/index.scss');

var generatePalette = function() {
  var colors = iWantHue().generate(
    7,
    function(color){
      var hcl = color.hcl();
      return hcl[0]>=0 && hcl[0]<=360 && hcl[1]>=0 && hcl[1]<=3 && hcl[2]>=0 && hcl[2]<=1.5;
    },
    false,
    50
  );
  console.log(colors);
  console.log(iWantHue().diffSort(colors));
};

var ColorSlider = React.createClass({
  handleSlider: function(value){
    this.props.onUpdate(value);
  },

  handleInput: function(key, event){
    var value = this.props.value;
    value[key] = parseInt(event.target.value);
    this.props.onUpdate(value);
  },

  render: function() {
    return (
      <fieldset className="ui-form">
        <ReactSlider
          min={this.props.min}
          max={this.props.max}
          step={this.props.step}
          defaultValue={this.props.value}
          onChange={this.handleSlider}
          className={this.props.className}
          withBars />
        <input type="text" value={this.props.value[0]} onChange={this.handleInput.bind(this, 0)}/>
        <input type="text" value={this.props.value[1]} onChange={this.handleInput.bind(this, 1)}/>
      </fieldset>
    );
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {
      hValue: [0, 360],
      cValue: [0, 3],
      lValue: [0, 1.5]
    };
  },

  onHueUpdate: function(value) {
    this.setState({hValue: value});
  },

  onChromaUpdate: function(value) {
    this.setState({cValue: value});
  },

  onLightnessUpdate: function(value) {
    this.setState({lValue: value});
  },

  render: function() {
    return (
      <div className="wrapper">
        <h1>Color</h1>
        <ColorSlider
          min={0}
          max={360}
          value={this.state.hValue}
          onUpdate={this.onHueUpdate}
          className="slider hue-slider"/>
        <ColorSlider
          min={0}
          max={3}
          step={0.01}
          value={this.state.cValue}
          onUpdate={this.onChromaUpdate}
          className="slider chroma-slider"/>
        <ColorSlider
          min={0}
          max={1.5}
          step={0.015}
          value={this.state.lValue}
          onUpdate={this.onLightnessUpdate}
          className="slider lightness-slider"/>
        <dl>
          <dt>Hue range</dt>
          <dd>{this.state.hValue[0]} to {this.state.hValue[1]}</dd>
        </dl>
        <dl>
          <dt>Chroma range</dt>
          <dd>{this.state.cValue[0]} to {this.state.cValue[1]}</dd>
        </dl>
        <dl>
          <dt>Lightness range</dt>
          <dd>{this.state.lValue[0]} to {this.state.lValue[1]}</dd>
        </dl>
      </div>
    );
  }
});
React.render(<App />, document.getElementById('content')); // jshint ignore:line

module.exports = App;
