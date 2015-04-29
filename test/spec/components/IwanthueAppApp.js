'use strict';

describe('Main', function () {
  var React = require('react/addons');
  var IwanthueAppApp, component;

  beforeEach(function () {
    var container = document.createElement('div');
    container.id = 'content';
    document.body.appendChild(container);

    IwanthueAppApp = require('components/IwanthueAppApp.js');
    component = React.createElement(IwanthueAppApp);
  });

  it('should create a new instance of IwanthueAppApp', function () {
    expect(component).toBeDefined();
  });
});
