'use strict';
var flux = require('scripts/core/flux');
var CustomFluxMixin = require('scripts/common/mixins/CustomFluxMixin');
var d3Chart = require('./d3Chart');

var ChartExplorerSummary = React.createClass({
    getDefaultProps: function() {
        return {
            width: '100%',
            height: '300px'
        };
    },

    componentWillMount() {},

    componentWillReceiveProps() {},

    componentDidMount: function() {
        var el = this.getDOMNode();
        var state = this.prepareGraphState(this.props)
        d3Chart.create(el, state);
    },

    componentDidUpdate: function(prevProps, prevState) {
        var el = this.getDOMNode();
        var state = this.prepareGraphState(this.props)
        d3Chart.update(el, state);
    },

    prepareGraphState(props) {
        var allData = props.data;
        // console.log('data raw before tydied ---------------------: ', allData)

        var data = _.map(allData, function(d) {
            var ret = {
                date: {
                    key: 'date-time',
                    value: moment(d.date).toDate(),
                    displayName: 'Date'
                },
                // x: [{
                //     key: 'date-time',
                //     value: moment(d.date).toDate(),
                //     displayName: 'Date'
                // }],
                y: [{
                    key: 'unfiltered_impressions',
                    value: d.unfiltered_impressions,
                    displayName: 'Total impression'
                }, {
                    key: 'filtered_impressions',
                    value: d.filtered_impressions,
                    displayName: 'Filtered impression'
                }, {
                    key: 'filtered_clicks',
                    value: d.filtered_clicks* 1,
                    displayName: 'Filtered clicks'
                }, {
                    key: 'ctr',
                    value: d.filtered_impressions === 0 ? 0 : d.filtered_clicks / d.filtered_impressions, // Handling devision by zero
                    displayName: 'ctr'
                }],
                id: _.uniqueId()
            };
            return ret;
        });

        var meta = {};
        meta.dataIndex = {
            unfilteredImpressions : 0,
            filteredImpressions : 1,
            filteredClicks : 2,
            ctr : 3
        };


        // var dataTest = [
        //       { x: [{ value: moment('2015-07-04').toDate()}], y: [{ value: 7000,   },{ value: 700,   },{ value: 70, },{ value: 0.7,  } ], id: _.uniqueId() }
        //     , { x: [{ value: moment('2015-07-03').toDate()}], y: [{ value: 6000,   },{ value: 600,   },{ value: 60, },{ value: 0.6,  } ], id: _.uniqueId() }
        //     , { x: [{ value: moment('2015-07-02').toDate()}], y: [{ value: 5000,   },{ value: 500,   },{ value: 50, },{ value: 0.5,  } ], id: _.uniqueId() }
        //     , { x: [{ value: moment('2015-07-01').toDate()}], y: [{ value: 0,      },{ value: 0,     },{ value: 0,  },{ value: 0.0,  } ], id: _.uniqueId() }
        //     , { x: [{ value: moment('2015-06-30').toDate()}], y: [{ value: 3000,   },{ value: 300,   },{ value: 30, },{ value: 0.3,  } ], id: _.uniqueId() }
        //     , { x: [{ value: moment('2015-06-29').toDate()}], y: [{ value: 2000,   },{ value: 200,   },{ value: 20, },{ value: 0.2,  } ], id: _.uniqueId() }
        //     , { x: [{ value: moment('2015-06-28').toDate()}], y: [{ value: 1000,   },{ value: 100,   },{ value: 10, },{ value: 0.1,  } ], id: _.uniqueId() }
        //     , { x: [{ value: moment('2015-06-29').toDate()}], y: [{ value: 0,      },{ value: 0,     },{ value: 0,  },{ value: 0.0,  } ], id: _.uniqueId() }
        // ];

        // var dataTest = [
        //       { x: [{ value: moment('2015-07-04').toDate()}], y: [{ value: 7000,   },{ value: 700,   },{ value: 70, },{ value: 0.7,  } ], id: _.uniqueId() }
        //     , { x: [{ value: moment('2015-07-03').toDate()}], y: [{ value: 6000,   },{ value: 600,   },{ value: 60, },{ value: 0.6,  } ], id: _.uniqueId() }
        //     , { x: [{ value: moment('2015-07-02').toDate()}], y: [{ value: 5000,   },{ value: 500,   },{ value: 50, },{ value: 0.5,  } ], id: _.uniqueId() }
        //     , { x: [{ value: moment('2015-07-01').toDate()}], y: [{ value: 3000,   },{ value: 300,   },{ value: 30, },{ value: 0.3,  } ], id: _.uniqueId() }
        //     , { x: [{ value: moment('2015-06-30').toDate()}], y: [{ value: 3000,   },{ value: 300,   },{ value: 30, },{ value: 0.3,  } ], id: _.uniqueId() }
        //     , { x: [{ value: moment('2015-06-29').toDate()}], y: [{ value: 2000,   },{ value: 200,   },{ value: 20, },{ value: 0.2,  } ], id: _.uniqueId() }
        //     , { x: [{ value: moment('2015-06-28').toDate()}], y: [{ value: 1000,   },{ value: 100,   },{ value: 10, },{ value: 0.1,  } ], id: _.uniqueId() }
        //     , { x: [{ value: moment('2015-06-27').toDate()}], y: [{ value: 1000,   },{ value: 100,   },{ value: 10, },{ value: 0.1,  } ], id: _.uniqueId() }
        // ];

        var dataTest = [
              { x: [{ value: moment('2015-07-04').toDate()}], y: [{ value: 0,   },{ value: 0,   },{ value: 7, },{ value: 7,  } ], id: _.uniqueId() }
            , { x: [{ value: moment('2015-07-03').toDate()}], y: [{ value: 0,   },{ value: 0,   },{ value: 6, },{ value: 6,  } ], id: _.uniqueId() }
            , { x: [{ value: moment('2015-07-02').toDate()}], y: [{ value: 0,   },{ value: 0,   },{ value: 5, },{ value: 5,  } ], id: _.uniqueId() }
            , { x: [{ value: moment('2015-07-01').toDate()}], y: [{ value: 0,   },{ value: 0,   },{ value: 0, },{ value: 0,  } ], id: _.uniqueId() }
            , { x: [{ value: moment('2015-06-30').toDate()}], y: [{ value: 0,   },{ value: 0,   },{ value: 3, },{ value: 3,  } ], id: _.uniqueId() }
            , { x: [{ value: moment('2015-06-29').toDate()}], y: [{ value: 0,   },{ value: 0,   },{ value: 2, },{ value: 2,  } ], id: _.uniqueId() }
            , { x: [{ value: moment('2015-06-28').toDate()}], y: [{ value: 0,   },{ value: 0,   },{ value: 1, },{ value: 1,  } ], id: _.uniqueId() }
        ];

        var state = {};

        // console.log('data for chart -----: ', data);

        _.extend(state, { data: data }, {meta: meta});
        // _.extend(state, { data: dataTest }, {meta: meta});
        return state;
    },

    render: function() {
        return ( < div  className="am-chart-explorer-summary" >< /div>);
    }

});

module.exports = ChartExplorerSummary;
