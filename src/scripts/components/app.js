'use strict';

var React = require('react/addons');
var cx = React.addons.classSet;
var chroma = require('chroma-js');
var jsonFormat = require('json-format');

var iWantHue = require('iwanthue-api');
var ReactSlider = require('react-slider');

// CSS
require('../../styles/normalize.css');
require('../../styles/index.scss');

var Toggle = React.createClass({
  render: function() {
    var toggleClassName = cx({
      "ui-toggle": true,
      "is-true": this.props.isTrue
    });

    return (
      <fieldset className="ui-form">
        <label>{this.props.label}</label>
        <div onClick={this.props.onToggle}>
          <div className={toggleClassName}>
            <div className="ui-toggle__handle"/>
          </div>
          <span className="ui-toggle__label">
            {this.props.toggleLabel[this.props.isTrue ? 'true' : 'false']}
          </span>
        </div>
      </fieldset>
    );
  }
});

var ColorInput = React.createClass({
  handleInput: function(event){
    this.props.handleBase(event.target.value);
  },

  render: function(){
    return (
      <div className="ui-card__content ui-form">
        <label>Base color value</label>
        <input
          type="text"
          value={this.props.base}
          onChange={this.handleInput}
          placeholder="Hex, rgb(), hsl(), etc."/>
      </div>
    );
  }
});

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
        <label>{this.props.label}</label>
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
          type="number"
          value={this.props.value[0]}
          onChange={this.handleInput.bind(this, 0)}/>
        <input
          className="slider-input"
          type="number"
          value={this.props.value[1]}
          onChange={this.handleInput.bind(this, 1)}/>
      </fieldset>
    );
  }
});

var Results = React.createClass({
  getInitialState: function() {
    return {
      diff: false
    };
  },

  toggleDiff: function() {
    this.setState({diff: !this.state.diff});
  },

  handleDownload: function() {
    var output = jsonFormat(this.props.palette);
    window.open('data:application/json;' + (window.btoa ? 'base64,' + btoa(output) : output));
  },

  render: function() {
    var palette = this.state.diff ? iWantHue().diffSort(this.props.palette) : this.props.palette;

    return (
      <span>
        {this.props.palette ?
          <div className="ui-card__content results">
            <Toggle
              isTrue={this.state.diff}
              toggleLabel={{'true': "Sort colors by differentiation", 'false': "Don't differentiate colors"}}
              onToggle={this.toggleDiff}/>
            <div className="swatches">
              {palette.map(function(color, i) {
                // var backgroundColor = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                return (
                  <div key={i} className="swatch__container ui-form">
                    <div className="swatch" style={{backgroundColor: color.hex()}}/>
                    <input type="text" defaultValue={color.hex()}/>
                  </div>
                );
              })}
            </div>
            <button className="ui-button small" onClick={this.handleDownload}>Download</button>
            {/*<pre className="ui-card__content">
              {jsonFormat(this.props.palette)}
            </pre>*/}
          </div>
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

  handleBase: function(value) {
    var colorHSL = chroma(value).hsl();
    var colorHue = colorHSL[0];

    var hValueStart = colorHue - this.state.range / 2;
    var hValueEnd = hValueStart + this.state.range;

    var hValue = [
      hValueStart,
      hValueEnd,
    ];

    this.setState({hValue: hValue});
  },

  handleRange: function(event) {
    var value = parseInt(event.target.value);
    this.setState({range: value});
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

  handleSteps: function(event) {
    var value = event.target.value;
    this.setState({steps: value});
  },

  handleSwatches: function(event) {
    var value = event.target.value;
    this.setState({swatches: value});
  },

  toggleVector: function() {
    this.setState({vector: !this.state.vector});
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
        <div className="ui-row">
          <div className="ui-col-4of12">
            <div className="ui-card">
              <header className="ui-card__header">
                <h3>1. Color input</h3>
              </header>
              <div className="ui-card__content ui-form">
                <label>Hue range degrees</label>
                <input type="number" value={this.state.range} onChange={this.handleRange}/>
              </div>
              <ColorInput base={this.state.base} handleBase={this.handleBase}/>
            </div>
          </div>
          <div className="ui-col-4of12">
            <div className="ui-card">
              <header className="ui-card__header">
                <h3>2. Color generator</h3>
              </header>
              <ColorSlider
                label="Hue"
                min={0}
                max={360}
                value={this.state.hValue}
                onUpdate={this.onHueUpdate}
                className="slider hue-slider"/>
              <ColorSlider
                label="Chroma"
                min={0}
                max={3}
                step={0.01}
                value={this.state.cValue}
                onUpdate={this.onChromaUpdate}
                className="slider chroma-slider"/>
              <ColorSlider
                label="Lightness"
                min={0}
                max={1.5}
                step={0.015}
                value={this.state.lValue}
                onUpdate={this.onLightnessUpdate}
                className="slider lightness-slider"/>
              <div className="ui-card__content">
                <fieldset className="ui-form">
                  <label>Color steps</label>
                  <input type="number" value={this.state.steps} onChange={this.handleSteps}/>
                  <p className="hint"/>
                </fieldset>
                <fieldset className="ui-form">
                  <label># of swatches</label>
                  <input type="number" value={this.state.swatches} onChange={this.handleSwatches}/>
                  <p className="hint"/>
                </fieldset>
                <Toggle
                  label="Color vector"
                  isTrue={this.state.vector}
                  toggleLabel={{'true': "Using force vector", 'false': "Using k-means"}}
                  onToggle={this.toggleVector}/>
              </div>
            </div>
          </div>
          <div className="ui-col-4of12">
            <div className="ui-card">
              <header className="ui-card__header">
                <h3>3. Results</h3>
              </header>
              <div className="ui-card__content">
                <button className="ui-button primary" onClick={this.handleGenerate}>Generate</button>
              </div>
              <Results palette={this.state.palette}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
React.render(<App />, document.getElementById('content')); // jshint ignore:line

module.exports = App;
