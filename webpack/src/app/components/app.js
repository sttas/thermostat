import React from 'react';
import AppBar from 'material-ui/lib/app-bar';
import Logo from 'material-ui/lib/svg-icons/hardware/device-hub';
import IconButton from 'material-ui/lib/icon-button';
import SettingsIcon from 'material-ui/lib/svg-icons/action/settings';
import SettingsInputIcon from 'material-ui/lib/svg-icons/action/settings-input-component';
import RouterIcon from 'material-ui/lib/svg-icons/hardware/router';
import WarningIcon from 'material-ui/lib/svg-icons/alert/warning';
import FlatButton from 'material-ui/lib/flat-button';
import TextField from 'material-ui/lib/text-field';
import Colors from 'material-ui/lib/styles/colors';
import CircularProgress from 'material-ui/lib/circular-progress';
import Snackbar from 'material-ui/lib/snackbar';

import ThermostatCard from './gauge';


const AppContainer = React.createClass({

  propTypes: {
    comfort: React.PropTypes.any,
    data: React.PropTypes.object.isRequired,
    device: React.PropTypes.any,
    eco: React.PropTypes.any,
    settings: React.PropTypes.any,
    socket: React.PropTypes.any,
    message: React.PropTypes.message,
  },

  getInitialState() {
    return {
      message: false,
      mode: false,
      ip: this.props.settings.ip,
      password: '',
      port: this.props.settings.port,
      gis: this.props.settings.gis,
      pool: this.props.settings.pool,
      eco: this.props.settings.eco,
      windowWidth: window.innerWidth,
      comfort: this.props.settings.comfort,
    };
  },

  handleResize: function(e) {
    this.setState({windowWidth: window.innerWidth});
  },

  componentDidMount: function() {
    window.addEventListener('resize', this.handleResize);
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize);
  },

  handleSettingsClick() {
    this.setState({
      mode: 'settings',
      ip: this.props.settings.ip,
      port: this.props.settings.port,
      gis: this.props.settings.gis,
      pool: this.props.settings.pool,
      eco: this.props.settings.eco,
      comfort: this.props.settings.comfort,
    });
  },

  handleSettingsCancelClick() {
    this.setState({
      mode: 'default',
    });
  },

  handleSettingsSaveClick() {

    if (this.props.socket) {
      this.props.socket.emit('savesettings', {
        ip: this.state.ip,
        port: this.state.port,
        gis: this.state.gis,
        pool: this.state.pool,
        password: this.state.password,
        eco: this.state.eco,
        comfort: this.state.comfort,
      }, function(res) {
        if (res) {
          this.setState({
            mode: 'default',
          });
        }

      }.bind(this));
    }
  },

  render() {

    const wrapStyles = {
      top:0,
      left:0,
      right:0,
      background: '#f5f5f5',
      bottom:0,
      position: 'absolute',
    };

    const barStyles = {
      position: 'absolute',
    };

    const bodyStyles = {
      background: '#f5f5f5',
      height: '100%',
      paddingTop: 63,
      zIndex:99,
      textAlign:'center',
      marginTop: 20,
      marginLeft: 20,
      marginRight: 20,
    };

    if (!this.props.settings) {
      return <div style={{margin:'100px auto', width:100}}><CircularProgress /><div>соединение...</div></div>;
    }

    const settingsFieldStyles = this.state.windowWidth > 600 ? {
      margin:10, width: 256,
    } : {
      width: '100%',
    };

    let MainCard = null;
    if (this.state.mode === 'settings') {
      MainCard = (
        <div align="center">
          <div style={bodyStyles}>

            <TextField
              floatingLabelText="IP адрес устройства"
              style={settingsFieldStyles}
              value={this.state.ip}
              onChange={function(e) {
                const value = e.target.value;

                //const regex = new RegExp([
                //  '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}',
                //  '([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$',
                //].join(''));

                //if (regex.test(value)) {
                this.setState({ip: value});
                //}
              }.bind(this)}
            />

            <TextField
              floatingLabelText="Порт устройства"
              style={settingsFieldStyles}
              value={this.state.port}
              onChange={function(e) {
                const value = parseInt(e.target.value);
                if (value > 0 && value < 65536) {
                  this.setState({port: value});
                }
              }.bind(this)}
            />

            <TextField
                floatingLabelText="Периодичность опроса (секунда)"
                style={settingsFieldStyles}
                value={this.state.pool}
                onChange={function(e) {
                const value = parseInt(e.target.value);
                if (value >= 1) {
                  this.setState({pool: value});
                }
              }.bind(this)}
            />

            <TextField
                floatingLabelText="Гистерезис (°C)"
                style={settingsFieldStyles}
                value={this.state.gis}
                onChange={function(e) {
                const value = parseInt(e.target.value);
                if (value > 0 && value < 10) {
                  this.setState({gis: value});
                }
              }.bind(this)}
            />

            <TextField
                floatingLabelText="Пароль веб сервера"
                style={settingsFieldStyles}
                onChange={function(e) {
                this.setState({password: e.target.value});
              }.bind(this)}
            />

          </div>
        </div>
      );
    } else {
      MainCard = (
        <ThermostatCard
          data={this.props.data}
          device={this.props.device}
          socket={this.props.socket}
          server={this.props.server}
          settings={this.props.settings}
          mode={this.props.settings.mode}
          thermostat={this.props.settings.thermostat}
          modeName="*"
        />
      );
    }

    let rightButton = null, title = null, LogoIcon = null;
    if (this.state.mode === 'settings') {
      title = 'НАСТРОЙКИ';
      LogoIcon = SettingsIcon;
      rightButton = (
        <div style={{marginTop:8}}>
          <FlatButton key="cancel" label="Отмена" style={{
            color: '#43a047',
          }} onTouchTap={this.handleSettingsCancelClick} />

          <FlatButton key="save" label="Сохранить" style={{
            color: '#43a047',
          }} onTouchTap={this.handleSettingsSaveClick} />
        </div>
      );
    } else {
      title = 'УКРРЕЛЕ';
      LogoIcon = Logo;
      rightButton = (
        <div>
          {this.props.device ?
              null  : <IconButton key="first" tooltip="Нет соединения с устройством"><WarningIcon color="#43a047" /></IconButton>}
          {this.props.server ?
              null  : <IconButton key="second" tooltip="Нет соединения с программой"><WarningIcon color="#43a047" /></IconButton>}

          <IconButton tooltip="Настройки" key="third" onTouchTap={this.handleSettingsClick}>
            <SettingsIcon color="#43a047"/>
          </IconButton>
        </div>
      );
    }

    return (
      <div style={wrapStyles}>
        <header style={{
          position: 'fixed',
          zIndex: 1101,
          width: '100%',
          display: 'flex',
        }}>
          <AppBar
              className="app-header"
            key="header"
            style={barStyles}
            iconElementLeft={<IconButton><LogoIcon color="#43a047"/></IconButton>}
            iconElementRight={(<span>{rightButton}</span>)}
            title={[<div style={{fontWeight:100, color: '#43a047'}}>{title}</div>]}
          />
        </header>

        {MainCard}

        <div>
          <Snackbar
            open={this.props.message ? true : false}
            message={this.props.message}
            autoHideDuration={5000}
          />
        </div>
      </div>
    );
  },
});


export default AppContainer;

