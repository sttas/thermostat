import React from 'react';
import Divider from 'material-ui/lib/divider';
import Colors from 'material-ui/lib/styles/colors';

import Slider from 'material-ui/lib/slider';
import Toggle from 'material-ui/lib/toggle';

const AppContainer = React.createClass({

  propTypes: {
    data: React.PropTypes.object.isRequired,
    device: React.PropTypes.any,
    mode: React.PropTypes.string.isRequired,
    modeName: React.PropTypes.string.isRequired,
    settings: React.PropTypes.any,
    socket: React.PropTypes.any,
  },

  onMainButtonClick() {
    this.props.socket.emit('update', {
      key: 'mode',
      value: this.props.mode,
    });
  },

  onSliderValueChanged(event, value) {
    if (this.props.socket) {
      this.props.socket.emit('update', {
        key: this.props.mode,
        value: value,
      });
    }
  },

  modeChange: function(e, checked) {
    if (this.props.socket) {
      this.props.socket.emit('update', {
        key: 'mode',
        value: checked ? 'comfort' : 'eco',
      });
    }
  },

  render() {

    const bodyStyles = {
      background: '#fff',
      height: '100%',
      paddingTop: 63,
      zIndex:99,
      width: 300,
      textAlign:'center',
      margin: 'auto',
    };

    const temperature = this.props.settings[this.props.mode];

    const current = {
      0: this.props.device && this.props.server ? this.props.data.temperature[0]+'°C':'-',
      1: this.props.device && this.props.server ? this.props.data.temperature[1]+'°C':'-',
      2: this.props.device && this.props.server ? this.props.data.temperature[2]+'°C':'-',
      3: this.props.device && this.props.server ? this.props.data.temperature[3]+'°C':'-',
      4: this.props.device && this.props.server ? this.props.data.temperature[4]+'°C':'-',
      5: this.props.device && this.props.server ? this.props.data.temperature[5]+'°C':'-',
      6: this.props.device && this.props.server ? this.props.data.temperature[6]+'°C':'-',
    };

    const switchOffColor = '#c8e6c9';
    const switchOnColor = '#43a047';

    return (
      <div align="center">
        <div style={bodyStyles}>

          <svg width={300} height={300} style={{transform: 'rotate(2deg)', marginTop: 40}}>
            <g transform="translate(150,150)">

              <g zIndex="100">
                <g opacity="1">
                  <path d="M7.105427357601002e-15,-124.89995996796797A5,5 0 0,1 5.200000000000007,-129.8959583666867A130,130 0 0,1 76.27438743929302,-105.27211321504197A5,5 0 0,1 77.26909893442965,-98.12994624405599L58.690093762484636,-74.53504473836963A5,5 0 0,1 51.87955450852549,-73.54258510548112A90,90 0 0,0 4.736842105263163,-89.87525981531182A5,5 0 0,1 5.329070518200751e-15,-94.86832980505137Z" fill={(this.props.data.reley[0] === true && this.props.server && this.props.device) ? switchOnColor : switchOffColor} id="d1"></path>
                  <path fill="none" stroke="none" d="M6.245698675651501e-15,-102A102,102 0 0,1 63.10208660861952,-80.13817233777098L63.10208660861952,-80.13817233777098A102,102 0 0,0 6.245698675651501e-15,-102Z" id="arc-labeld1"></path>
                  <text textAnchor="middle" style={{fontSize: 15, color: '#fff'}} dangerouslySetInnerHTML={{__html: '<textPath startOffset="25%" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#arc-labeld1" style="fill:#fff; baseline-shift:15%">' + current[0] + '</textPath>' }} />
                </g>
                <g opacity="1">
                  <path d="M81.13144311094979,-94.9615129341078A5,5 0 0,1 88.33026389004368,-95.38220211923841A130,130 0 0,1 126.37321659575558,-30.492788118541174A5,5 0 0,1 122.49014885971536,-24.416458226466233L93.03794687262919,-18.54563133802215A5,5 0 0,1 87.21521647395483,-22.21499528249332A90,90 0 0,0 61.981823081600496,-65.25529562787356A5,5 0 0,1 61.623754760075826,-72.1284468796468Z" fill={(this.props.data.reley[1] === true && this.props.server && this.props.device) ? switchOnColor : switchOffColor} id="d2"></path>
                  <path fill="none" stroke="none" d="M66.2562838245841,-77.55065991825057A102,102 0 0,1 100.03201912070425,-19.939788129141665L100.03201912070425,-19.939788129141665A102,102 0 0,0 66.2562838245841,-77.55065991825057Z" id="arc-labeld2"></path>
                  <text textAnchor="middle" style={{fontSize: 15, color: '#fff'}} dangerouslySetInnerHTML={{__html: '<textPath startOffset="25%" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#arc-labeld2" style="fill:#fff; baseline-shift:15%">' + current[1] + '</textPath>' }} />
                </g>
                <g opacity="1">
                  <path d="M123.36856771321881,-19.498628166846657A5,5 0 0,1 129.1151030475707,-15.142330237291665A130,130 0 0,1 115.88887418801791,58.90474377699771A5,5 0 0,1 108.98956533136784,61.00225117878436L82.78351755931006,46.3345359371107A5,5 0 0,1 80.74000612810732,39.7624371792423A90,90 0 0,0 89.5127908930579,-9.352019382769065A5,5 0 0,1 93.70515388792775,-14.810271261519025Z" fill={(this.props.data.reley[2] === true && this.props.server && this.props.device) ? switchOnColor : switchOffColor} id="d3"></path>
                  <path fill="none" stroke="none" d="M100.7493830260276,-15.923624583454028A102,102 0 0,1 89.00671919070741,49.81770708198599L89.00671919070741,49.81770708198599A102,102 0 0,0 100.7493830260276,-15.923624583454028Z" id="arc-labeld3"></path>
                  <text textAnchor="middle" style={{fontSize: 15, color: '#fff'}} dangerouslySetInnerHTML={{__html: '<textPath startOffset="25%" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#arc-labeld3" style="fill:#fff; baseline-shift:15%">' + current[2] + '</textPath>' }} />
                </g>
                <g opacity="1">
                  <path d="M106.46294589551098,65.31187603529318A5,5 0 0,1 108.0023134972511,72.35675697017867A130,130 0 0,1 -105.02242463094409,76.61781988961617A5,5 0 0,1 -103.76600845710512,69.51701582260266L-78.81594129723528,52.801963954295886A5,5 0 0,1 -72.03129484434365,53.958248331902254A90,90 0 0,0 74.13143191606636,51.034603967049826A5,5 0 0,1 80.86441233306182,49.607930999272284Z" fill="#ffffff" id="empty"></path>
                  <path fill="none" stroke="none" d="M86.94334637198516,53.33717766849887A102,102 0 0,1 -84.74088274599242,56.77132014873321L-84.74088274599242,56.77132014873321A102,102 0 0,0 86.94334637198516,53.33717766849887Z" id="arc-labelempty"></path>
                </g>
                <g opacity="1">
                  <path d="M-106.46294589551097,65.31187603529318A5,5 0 0,1 -113.44061396541174,63.49194518323116A130,130 0 0,1 -129.61735644089924,-9.966990983886486A5,5 0 0,1 -124.04962317560528,-14.549604461645535L-94.22245264637239,-11.051217910353444A5,5 0 0,1 -89.81517123628274,-5.764981855757532A90,90 0 0,0 -79.08534934657706,42.95937055788713A5,5 0 0,1 -80.8644123330618,49.607930999272284Z" fill={(this.props.data.reley[3] === true && this.props.server && this.props.device) ? switchOnColor : switchOffColor} id="d4"></path>
                  <path fill="none" stroke="none" d="M-86.94334637198516,53.337177668498875A102,102 0 0,1 -101.30556941056474,-11.881986635291549L-101.30556941056474,-11.881986635291549A102,102 0 0,0 -86.94334637198516,53.337177668498875Z" id="arc-labeld4"></path>
                  <text textAnchor="middle" style={{fontSize: 15, color: '#fff'}} dangerouslySetInnerHTML={{__html: '<textPath startOffset="25%" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#arc-labeld4" style="fill:#fff; baseline-shift:15%">' + current[3] + '</textPath>' }} />
                </g>
                <g opacity="1">
                  <path d="M-123.36856771321881,-19.498628166846583A5,5 0 0,1 -127.49151779592444,-25.414816349749305A130,130 0 0,1 -92.07387985632738,-91.77363808960935A5,5 0 0,1 -84.86399428561059,-91.64116146084059L-64.45883089575086,-69.60645889249786A5,5 0 0,1 -64.5417600584878,-62.7244865148579A90,90 0 0,0 -88.03381647354207,-18.709547218003774A5,5 0 0,1 -93.70515388792776,-14.81027126151897Z" fill={(this.props.data.reley[4] === true && this.props.server && this.props.device) ? switchOnColor : switchOffColor} id="d5"></path>
                  <path fill="none" stroke="none" d="M-100.74938302602762,-16.923624583453972A102,102 0 0,1 -69.30448512034947,-74.83908298611937L-69.30448512034947,-74.83908298611937A102,102 0 0,0 -100.74938302602762,-15.923624583453972Z" id="arc-labeld5"></path>
                  <text textAnchor="middle" style={{fontSize: 15, color: '#fff'}} dangerouslySetInnerHTML={{__html: '<textPath startOffset="25%" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#arc-labeld5" style="fill:#fff; baseline-shift:15%">' + current[4] + '</textPath>' }} />
                </g>
                <g opacity="1">
                  <path d="M-81.13144311094986,-94.96151293410773A5,5 0 0,1 -80.42313778073193,-102.13774478370574A130,130 0 0,1 -10.390293443255663,-129.58411091705278A5,5 0 0,1 -4.994666239056325,-124.80005332194546L-3.793721344302045,-94.79244525995617A5,5 0 0,1 -8.327104936680254,-89.613946031706A90,90 0 0,0 -54.77897541117482,-71.40913003882561A5,5 0 0,1 -61.6237547600759,-72.12844687964676Z" fill={(this.props.data.reley[5] === true && this.props.server && this.props.device) ? switchOnColor : switchOffColor} id="d6"></path>
                  <path fill="none" stroke="none" d="M-66.25628382458416,-77.55065991825052A102,102 0 0,1 -4.078912087036707,-101.91841087941975L-4.078912087036707,-101.91841087941975A102,102 0 0,0 -66.25628382458416,-77.55065991825052Z" id="arc-labeld6"></path>
                  <text textAnchor="middle" style={{fontSize: 15, color: '#fff'}} dangerouslySetInnerHTML={{__html: '<textPath startOffset="25%" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#arc-labeld6" style="fill:#fff; baseline-shift:15%">' + current[5] + '</textPath>' }} />
                </g>
              </g>
            </g>
          </svg>

          <div style={{marginTop: -240, zIndex:999, width:300, position: 'absolute'}}>
            <div style={{margin: 40, fontSize: 20, textAlign: 'center', color: Colors.grey300, lineHeight: '180%'}}>
              до<br />{this.props.device && this.props.server ?temperature:'?'}°C
              <Toggle style={{margin: '25px auto', width: 50}}
                defaultToggled={this.props.mode === 'comfort'}
                onToggle={this.modeChange}
                disabled={this.props.device && this.props.server  ? false : true}
              />
            </div>

            <div style={{margin: 40, fontSize: 20, textAlign: 'center', color: Colors.grey300}}>
              режим
            </div>
            <div style={{
              margin: '20px 0 0 0',
              fontSize: 30,
              fontWeight: 100,
              textAlign: 'center',
              color: Colors.grey400,
            }}
            >
              {this.props.server}
              {this.props.device && this.props.server ?this.props.modeName:'-'}
            </div>
          </div>
        </div>
      </div>
    );
  },
});


export default AppContainer;

