'use strict';

var React = require('react/addons');
// var _ = require('lodash');

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
      <fieldset className="ui-form">
        <ReactSlider
          min={this.props.min}
          max={this.props.max}
          step={this.props.step}
          defaultValue={this.props.value}
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
      <div>
        {this.props.palette ?
          <pre>
            {JSON.stringify(this.props.palette)}
          </pre>
        : null}

        {this.props.palette ? this.props.palette.map(function(color, i) {
          var backgroundColor = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
          return <div className="swatch" style={{backgroundColor: backgroundColor}}/>;
        }) : null}
      </div>
    );
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {
      hValue: [0, 360],
      cValue: [0, 3],
      lValue: [0, 1.5],
      swatches: 20,
      vector: false,
      steps: 50
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
        <button className="ui-button primary" onClick={this.handleGenerate}>Generate</button>
        <Results palette={this.state.palette}/>
      </div>
    );
  }
});
React.render(<App />, document.getElementById('content')); // jshint ignore:line

module.exports = App;
