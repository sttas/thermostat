/** In this file, we create a React component which incorporates components provided by material-ui */

import React from 'react';
import ThemeManager from 'material-ui/lib/styles/theme-manager';
import LightRawTheme from 'material-ui/lib/styles/raw-themes/light-raw-theme';
import Colors from 'material-ui/lib/styles/colors';
import AppContainer from './app';


const Main = React.createClass({

  childContextTypes: {
    muiTheme: React.PropTypes.object,
  },

  getInitialState() {
    return {
      muiTheme: ThemeManager.getMuiTheme(LightRawTheme),
      socket: false,
      server: false,
      settings: false,
      data: {
        temperature: ['-', '-', '-', '-', '-'],
        reley: ['-', '-', '-', '-', '-'],
      },
      message: false,
    };
  },

  getChildContext() {
    return {
      muiTheme: this.state.muiTheme,
    };
  },

  componentWillMount() {
    let newMuiTheme = ThemeManager.modifyRawThemePalette(this.state.muiTheme, {
      accent1Color: Colors.deepOrange500,
      primary1Color: Colors.green700,
    });

    this.setState({muiTheme: newMuiTheme});

    const socket = window.io.connect('http://localhost:3000');

    socket.on('init', function(data) {
      this.setState({
        socket: socket,
        settings: data.settings,
        server:true,
        data:data.data,
        device:data.device,
      });
    }.bind(this));

    socket.on('refresh', function(data) {
      let stateChange = {
        settings: data.settings,
        server: true,
      };
      if (data.data) {
        stateChange.data = data.data;
      }
      if (typeof data.device !== 'undefined') {
        stateChange.device = data.device;
        //if (data.device) {
        //  stateChange.message = false;
        //} else {
        //  stateChange.message = 'Нет соединения с устройством. Проверте настройки соединения.';
        //}
      }
      this.setState(stateChange);
    }.bind(this));

    socket.on('disconnect', function(data) {
      this.setState({
        message: 'соединение с сервером оборвалось',
        server: false,
      });
    }.bind(this));

    socket.on('reconnect', function(data) {
      this.setState({
        socket: socket,
        message: 'соединение востановлено',
        server: true,
      });

      setTimeout(function(){
        if (this.state.message === 'соединение востановлено') {
          this.state.message = '';
        }
      }.bind(this), 1000);
    }.bind(this));

    socket.on('reconnect_attempt', function(data) {
      this.setState({
        message: 'соединение...',
        server: false,
      });
    }.bind(this));

    socket.on('reconnect_error', function() {
      this.setState({
        message: 'ошибка соединения',
        server: false,
      });
    }.bind(this));

    socket.on('reconnecting', function() {
      this.setState({
        message: 'соединение...',
        server: false,
      });
    }.bind(this));

    socket.on('reconnect_failed', function(data) {
      this.setState({
        message: 'нет соединения с сервером',
        server: false,
      });
    }.bind(this));

    socket.on('device_error', function(data) {
      this.setState({
        message: data.message,
      });
    }.bind(this));

  },

  render() {
    return (
      <AppContainer
        socket={this.state.socket}
        settings={this.state.settings}
        data={this.state.data}
        message={this.state.message}
        device={this.state.device}
        server={this.state.server}
      />
    );
  },
});

export default Main;
