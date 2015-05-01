'use strict';

var React = require('react/addons');
var chroma = require('chroma-js');
var jsonFormat = require('json-format');

var iWantHue = require('iwanthue-api');
var ReactSlider = require('react-slider');

// CSS
require('../../styles/normalize.css');
require('../../styles/index.scss');

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
      <fieldset className="ui-card__content ui-form">
        <ReactSlider
          min={this.props.min}
          max={this.props.max}
          step={this.props.step}
          value={this.props.value}
          onChange={this.handleSlider}
          className={this.props.className}
          withBars />
        <input
          className="slider-input"
          type="text"
          value={this.props.value[0]}
          onChange={this.handleInput.bind(this, 0)}/>
        <input
          className="slider-input"
          type="text"
          value={this.props.value[1]}
          onChange={this.handleInput.bind(this, 1)}/>
      </fieldset>
    );
  }
});

var Results = React.createClass({
  render: function() {
    return (
      <span>
        {this.props.palette ?
          <span>
            <div className="swatches">
              {this.props.palette.map(function(color, i) {
                var backgroundColor = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                return <div key={i} className="swatch" style={{backgroundColor: backgroundColor}}/>;
              })}
            </div>
            <pre>
              {jsonFormat(this.props.palette)}
            </pre>
          </span>
        : null}
      </span>
    );
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {
      base: null,
      range: 180,
      hValue: [0, 360],
      cValue: [0, 3],
      lValue: [0, 1.5],
      swatches: 20,
      vector: false,
      steps: 50
    };
  },

  handleBase: function(event) {
    var colorHSL = chroma(event.target.value).hsl();
    var colorHue = colorHSL[0];

    var hValueStart = colorHue - this.state.range / 2;
    var hValueEnd = hValueStart + this.state.range;
    if(hValueStart < 0) {
      hValueEnd = 360 + hValueStart;
      hValueStart = hValueEnd - 90;
    } else if(hValueEnd > 360) {
      hValueStart = hValueEnd - 360;
      hValueEnd = hValueStart + this.state.range;
    }

    var hValue = [
      hValueStart,
      hValueEnd,
    ];

    this.setState({hValue: hValue});
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

  handleGenerate: function() {
    var colors = iWantHue().generate(
      this.state.swatches,
      function(color){
        var hcl = color.hcl();
        return (
          hcl[0]>=this.state.hValue[0] && hcl[0]<=this.state.hValue[1] &&
          hcl[1]>=this.state.cValue[0] && hcl[1]<=this.state.cValue[1] &&
          hcl[2]>=this.state.lValue[0] && hcl[2]<=this.state.lValue[1]
        );
      }.bind(this),
      this.state.vector,
      this.state.steps
    );

    this.setState({palette: colors});
  },

  render: function() {
    return (
      <div className="wrapper">
        <div className="ui-card">
          <div className="ui-card__content ui-form">
            <input
              type="text"
              value={this.state.base}
              onChange={this.handleBase}
              placeholder="Base color"/>
          </div>
        </div>
        <div className="ui-card">
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
          <footer className="ui-card__content">
            <button className="ui-button primary" onClick={this.handleGenerate}>Generate</button>
          </footer>
        </div>
        <Results palette={this.state.palette}/>
      </div>
    );
  }
});
React.render(<App />, document.getElementById('content')); // jshint ignore:line

module.exports = App;
