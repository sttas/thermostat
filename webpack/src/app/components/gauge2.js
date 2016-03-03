import React from 'react';
import assign from 'lodash/object/assign';
import SettingsIcon from 'material-ui/lib/svg-icons/action/power-settings-new';

const urGauge4 = function(selector, config) {
  this.selector = selector;
  this.render(config);
};

urGauge4.prototype.render = function(config) {

  const width = 420;//config.width;
  const height = 300;//config.height;

  const svg = d3.select(this.selector)
      .append("svg:svg")
      .attr("width", width)
      .attr("height", height);

  const filter = svg.append("defs")
      .append("filter")
      .attr("id", "blur")
      .append("feGaussianBlur")
      .attr("stdDeviation", 4);
  //
  //const radialGradient = svg.append("defs")
  //    .append("radialGradient")
  //    .attr("id", "radial-gradient");
  //
  //radialGradient.append("stop")
  //    .attr("offset", "0%")
  //    .attr("stop-color", "#fff");
  //
  //radialGradient.append("stop")
  //    .attr("offset", "100%")
  //    .attr("stop-color", "#F5F5F5");

  svg.append("circle")
      .attr("r", 0.98 * 110)
      .attr("transform", "translate(170,140)")
      .style("fill", "url(#radial-gradient)");


  const radialGradient = svg.append("defs")
      .append("pattern")
      .attr("x", 111)
      .attr("y", 111)
      .attr("height", 220)
      .attr("width", 220)
      .attr("patternUnits", "userSpaceOnUse")
      .attr("id", "radial-gradient");

  radialGradient.append("image")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", 220)
      .attr("width", 220)
      .attr("xlink:href", "assets/gauge-circle.png");

  const indicatorDef = svg.append("defs")
      .append("pattern")
      .attr("x", 111)
      .attr("y", 111)
      .attr("height", 220)
      .attr("width", 220)
      .attr("patternUnits", "userSpaceOnUse")
      .attr("id", "indicator");

  indicatorDef.append("image")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", 220)
      .attr("width", 220)
      .attr("xlink:href", "assets/gauge-ind.png");

  const gauge = iopctrl.arcslider()
      .radius(height/2 - 40)
      .ease("cubic-in")
      .indicator(function(g, r) {

        g.append("circle")
            .attr("r", 0.98 * r)
            .attr("class", "knob")
            .style("fill", "url(#indicator)");
      });

  gauge.axis().orient("out")
      .normalize(true)
      .tickSize(10)
      .scale(d3.scale.ordinal()
          .domain(["ЭКОНОМ", "КОМФОРТ", "ОБОГРЕВ", "ВЫКЛЮЧЕН"])
          .rangeBands([-7*Math.PI/8,  7*Math.PI/8]));

  svg.append("g")
      .attr("class", "gauge")
      .attr("cursor", "pointer")
      .attr("transform", "translate(10, -20)")
      .call(gauge);

  svg.append("svg:text")
      .attr("transform", "translate(" + (width*110/240) + ", " + (width*160/240) + ")")
      .attr("text-anchor", "middle")
      .attr("class", "gauge-label")
      .style("font-size", "18px")
      .style("stroke-width", "0px");

  svg.selectAll(".major")
      .attr("fill", '#888888')
      .style("font-size", "13px")
      .style("font-weight", "normal");

  svg.selectAll("line")
      .attr("stroke", '#888888')
      .attr("stroke-width", "1px");

  svg.selectAll(".domain")
      .attr("stroke", '#888888')
      .attr("stroke-width", "2px");

  svg.selectAll(".arc")
      .attr("cursor", 'pointer');

  svg.selectAll(".arc .lane")
      .attr("stroke", 'none')
      .attr("fill", "transparent");

  svg.selectAll(".arc .cursor")
      .attr("stroke", 'none')
      .attr("cursor", 'pointer')
      .attr("fill", "transparent");

  svg.selectAll('.touch circle').attr('r', width*2);

  this.gauge = gauge;
};


urGauge4.prototype.set = function(value) {
  this.gauge.value(value);
};
urGauge4.prototype.destroy = function() {

};

const AppContainer = React.createClass({

  propTypes: {
    data: React.PropTypes.object.isRequired,
    device: React.PropTypes.any,
    mode: React.PropTypes.string.isRequired,
    modeName: React.PropTypes.string.isRequired,
    settings: React.PropTypes.any,
    socket: React.PropTypes.any,
  },


  componentWillUnmount() {
    this.gauge.destroy();
  },

  componentDidMount() {
    const me = this;
    me.gauge = new urGauge4(me.d3cmp);

    this.setGaugeValue();

    this.gauge.gauge.onValueChanged(function(v) {

      if (me.props.socket) {

        let mode = null;
        if (v === 'КОМФОРТ') {
          mode = 'comfort';
        } else if (v === 'ЭКОНОМ') {
          mode = 'eco';
        } else if (v === 'ОБОГРЕВ') {
          mode = 'heating';
        } else {
          mode = 'disabled'
        }

        if (me.changeTimeout) clearTimeout(me.changeTimeout);

        me.changeTimeout = setTimeout(function(){
          me.props.socket.emit('update', {
            key: 'mode',
            value: mode,
          });
          me.changeTimeout = null;
        }, 1000);

      }

    });
  },

  getInitialState() {
    return {
      windowWidth: window.innerWidth,
    };
  },

  setGaugeValue() {
    if (this.props.mode === 'comfort') {
      this.gauge.set('КОМФОРТ');
    } else if (this.props.mode === 'eco') {
      this.gauge.set('ЭКОНОМ');
    } else if (this.props.mode === 'heating') {
      this.gauge.set('ОБОГРЕВ');
    } else {
      this.gauge.set('ВЫКЛЮЧЕН');
    }
  },

  componentDidUpdate(){
    if (!this.changeTimeout ) {
      this.setGaugeValue();
    }

  },

  render() {

    let devices = [], isWorking = this.props.device && this.props.server;
    for (let i = 0; i < 6; i++) {
      devices.push({
        temperature: isWorking ? this.props.data.temperature[i]+'°C':'-',
        reley: (this.props.data.reley[0] === true && isWorking) ? true : false,
      });
    }

    if (this.state.windowWidth > 600) {
      return (
          <div align="center" style={{marginTop: 140}}>
            <div style={{width: 520, margin: 'auto auto'}}>
              <div style={{float: 'left', width: 370, pointerEvents: isWorking ? 'inherit': 'none', opacity: isWorking ? 1 : 0.4}} ref={(ref) => this.d3cmp = ref} />
              <div style={{float: 'left', width: 90}}>
                {devices.map(function(result) {
                  return <div style={{width: 90, background: (result.reley ? 'white': '#eeeeee'), borderRadius: 4, border: '1px solid #F5F5F5', padding: 6, margin: 5, fontSize: 14, color: '#909090'}}>
                    <SettingsIcon style={{height: 22, marginBottom:-6, marginRight:12}} color={(result.reley ? '#43a047': '#909090')}/> <span style={{position: 'absolute', marginTop: 2}}>{result.temperature}</span>
                  </div>;
                })}
              </div>
            </div>
          </div>
      );
    } else {
      return (
          <div align="center" style={{marginTop: 140}}>
            <div>
              <div style={{width: 360, margin: '0 auto'}} ref={(ref) => this.d3cmp = ref} />
              <div style={{width: 240, margin: '0 auto'}}>
                {devices.map(function(result) {
                  return <div style={{width: 90, float: 'left', background: (result.reley ? 'white': '#eeeeee'), borderRadius: 4, border: '1px solid #F5F5F5', padding: 6, margin: 5, fontSize: 14, color: '#909090'}}>
                    <SettingsIcon style={{height: 22, marginBottom:-6, marginRight:12}} color={(result.reley ? '#43a047': '#909090')}/> <span style={{position: 'absolute', marginTop: 2}}>{result.temperature}</span>
                  </div>;
                })}
              </div>
            </div>
          </div>
      );
    }
  },
});


export default AppContainer;

