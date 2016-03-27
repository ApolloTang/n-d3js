'use strict'

/*
    prefix 'M_' is the moment wrapper
 */

var d3Chart = {};

d3Chart.init = function(el, data, meta) {
    window.d = this;

    var margin = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        },
        padding = {
            top: 10,
            right: 10,
            bottom: 30,
            left: 100
        }

    this._conf = {};
    this._conf.margin = margin;
    this._conf.padding = padding;
    this._conf.w_svg = 1000;
    this._conf.h_svg = 300;
    this._conf.w_wrap = this._conf.w_svg - margin.left - margin.right;

    this._conf.h_wrap = this._conf.h_svg - margin.top - margin.bottom;
    this._conf.width =  this._conf.w_wrap - padding.left - padding.right;
    this._conf.height = this._conf.h_wrap - padding.top - padding.bottom;

    this._conf.dataIndex = {};
    this._conf.dataIndex = meta.dataIndex;

    this._cache = {};
    if (data.length) this.updateCache(data, meta);
};


d3Chart.updateCache = function(data) {
    var that = this;

    // Ordinate (data axis)
        var dataUnfilteredImpression = data.map(function(d){ return d.y[that._conf.dataIndex.unfilteredImpressions].value; });
        var dataFilteredImpressions = data.map(function(d){ return d.y[that._conf.dataIndex.filteredImpressions].value; });
        var dataFilteredClinks = data.map(function(d){ return d.y[that._conf.dataIndex.filteredClicks].value; });

        // Calculate presentation data values
            var maxFilteredImpression = d3.max(dataFilteredImpressions, function(d){return d;});
            var minFilteredImpression = d3.min(dataFilteredImpressions, function(d){return d;});
            var maxFilteredClick = d3.max(dataFilteredClinks, function(d){return d;});

            var offSet_head = .2 * maxFilteredImpression;
            var offSet_floor = 0;

            if (maxFilteredImpression !== 0 && minFilteredImpression !== 0 ) {
                that._cache.headRoom = offSet_head;
                that._cache.floorOffset = offSet_floor;

                that._cache.maxDataY = maxFilteredImpression;
                that._cache.minDataY = minFilteredImpression;
                that._cache.data  =  scaleDataForDisplay(data)

            } else if (maxFilteredImpression !== 0 && minFilteredImpression ===0 ) {
                that._cache.headRoom = offSet_head;
                that._cache.floorOffset = 0;

                that._cache.maxDataY = maxFilteredImpression;
                that._cache.minDataY = 0;
                that._cache.data  =  scaleDataForDisplay(data)

            } else if (maxFilteredImpression === 0 && minFilteredImpression ===0 ) {
                that._cache.headRoom = 0;
                that._cache.floorOffset = 0;

                that._cache.maxDataY = 100;
                that._cache.minDataY = 0;
                that._cache.data  = flateLine(data);
            }

            function scaleDataForDisplay(data){
                if (data.length){
                    var FilteredClick_displayScaling = (maxFilteredImpression / maxFilteredClick) * .25 ; // need to catach division by zero
                    var clone_data = _.clone(data, true);
                    var ret = _.map(clone_data, function(item){
                        item.y[that._conf.dataIndex.filteredClicks].value = item.y[that._conf.dataIndex.filteredClicks].value * FilteredClick_displayScaling;
                        return item;
                    });
                    return ret;
                }
            }

            function flateLine(data){
                if (data.length){
                    var clone_data = _.clone(data, true);
                    var ret = _.map(clone_data, function(item){
                        item.y[that._conf.dataIndex.filteredImpressions].value = that._cache.maxDataY*0.05;
                        item.y[that._conf.dataIndex.filteredClicks].value = that._cache.maxDataY*0.02;
                        item.y[that._conf.dataIndex.ctr].value = 0;
                        return item;
                    });
                    return ret;
                }
            };

        var ordinateRange = this._cache.maxDataY - this._cache.minDataY;
        var deltaHeight_per_dataPoints =parseInt( this._conf.height/ordinateRange);
        this._cache.deltaHeight_per_dataPoints = deltaHeight_per_dataPoints;

    // Abscissa (date axis) is calculated based on unfiltered impressions
        var dataX = data.map(function(d){ return d.date.value; });
        var maxDataX = d3.max(dataX, function(d){ return d; });
        var minDataX = d3.min(dataX, function(d){ return d; });

        // prefix 'm_' is the moment wrapper
        var M_maxDataX = moment(d3.max(dataX, function(d){ return d; }));
        var M_minDataX = moment(d3.min(dataX, function(d){ return d; }));
        var howManyDays_btw_startEndDate = M_maxDataX.diff(M_minDataX, 'days') + 1; // include end point

        var deltaWidth_per_dataPoint =parseInt( this._conf.width/howManyDays_btw_startEndDate);
        this._cache.deltaWidth_per_dataPoint = deltaWidth_per_dataPoint;

        this._cache.dataResolutionOnXAxis = howManyDays_btw_startEndDate; // this will be calculated with an algorithm, but constant for now...

        this._cache.data_dates = dataX;
        this._cache.dateEnd = maxDataX;
        this._cache.dateStart = minDataX;

    // For ctr
        var dataCtr = data.map(function(d){ return d.y[that._conf.dataIndex.ctr].value; });
        var data_ctr_max= d3.max(dataCtr, function(d){ return d; });
        var data_ctr_min = d3.min(dataCtr, function(d){ return d; });
        this._cache.data_ctr_max = data_ctr_max;
        this._cache.data_ctr_min = data_ctr_min;
};


d3Chart.create = function(el, state) {
    var data = state.data;
    var meta = state.meta;

    this.init(el, data, meta);

    var viewBoxMaxX = this._conf.w_svg;
    var viewBoxMaxY = this._conf.h_svg;

    var svgContainer = d3.select(el).append('svg')
        .attr('class', 'd3')
        .attr('style', 'border:1px lightgray solid;')
        .attr('width', '100%').attr('height', '100%')
        .attr('viewBox', '0 0 ' + viewBoxMaxX + ' ' + viewBoxMaxY);

    var wrap = svgContainer
        .append('g').classed('wrap', true)
        .attr("transform", "translate(" + this._conf.margin.left + "," + this._conf.margin.top + ")");

    wrap.append("rect")
        .attr("class", "wrap-background")
        .attr("width", this._conf.w_wrap)
        .attr("height", this._conf.h_wrap)
        .attr("fill", '#FAFAFA');

    var plotArea = wrap.append('g').classed('plot-area', true)
        .attr("transform", "translate(" + this._conf.padding.left + "," + this._conf.padding.top + ")");

    plotArea.append("rect")
        .attr("class", "plot-area-background")
        .attr("width", this._conf.width)
        .attr("height", this._conf.height)
        .attr("fill", '#FAFAFA');

    var dataPoints_impressions = plotArea.append('g').classed('data-points-impressions', true);
    var dataPoints_clicks = plotArea.append('g').classed('data-points-clicks', true);
    var dataPoints_clicks = plotArea.append('g').classed('data-points-ctr', true);
    var dataPoints_clicks = plotArea.append('g').classed('data-line-ctr', true).append('path')
        .attr('fill', 'none')
        .attr('stroke', '#9C27B0')
        .attr('stroke-width', '2');

    this._prepareXAxisContainer();
    this._prepareYAxisContainer();
};


d3Chart.update = function(el, state) {
    var that = this;
    var data = state.data;

    if (data.length) {
        this.updateCache(data);

        this._updateXAxis();
        this._updateYAxis();

        // filtered impressions
        var options_filteredImpressions = {
            data: that._cache.data,
            dataIndex: this._conf.dataIndex.filteredImpressions,
            color: '#D4e157',
            el: d3.select(el).select('.data-points-impressions'),
            scales: this._scalesFilteredImpressions(data)
        };
        this._plotBar(options_filteredImpressions);

        // filtered clicks
        var options_filteredClicks = {
            data: that._cache.data,
            dataIndex: this._conf.dataIndex.filteredClicks,
            color: '#4DB6AC',
            el: d3.select(el).select('.data-points-clicks'),
            scales: this._scalesFilteredClicks(data)
        };
        this._plotBar(options_filteredClicks);

        // ctr (filtered data)
        var options_ctr = {
            data: that._cache.data,
            dataIndex: this._conf.dataIndex.ctr,
            color: '#9C27B0',
            el: d3.select(el).select('.data-points-ctr'),
            scales: this._scalesCtr(data)
        };
        this._plotLine(options_ctr);
    }
};


d3Chart._plotBar = function(opts){
    var that = this;

    var data = opts.data;
    var dataIndex = opts.dataIndex;
    var color = opts.color;
    var el = opts.el;
    var scales = opts.scales;

    var points = el;

    var point = points.selectAll('g').classed('data-point', true)
        .data(data, function(d) {return d.id})

    point.enter()
        .append('g').classed('data-point', true)

    var dataContainer = point
        .attr('transform', function(d){
            var dataDate = d.date.value;
            var dataX = parseInt(scales.x(dataDate));
            var dataY = parseInt(scales.y(d.y[dataIndex].value))
            var x = dataX;
            var y = that._conf.height - dataY;
            return "translate("+x+","+y+")";
        })

    // dataContainer.append("circle")
    //         .attr("class", "origin")
    //         .attr("r", 2);

    dataContainer.append('rect')
        .attr( 'fill', color)
        .attr( 'x', -1*parseInt(this._cache.deltaWidth_per_dataPoint/2) )
        .attr( 'stroke', color)
        .attr( 'width', this._cache.deltaWidth_per_dataPoint  )
        .attr( 'height', function(d){
            var o = parseInt(scales.y(d.y[dataIndex].value));
            return o;
        });

    point.exit().remove();
};

d3Chart._plotLine = function(opts){
    var that = this;

    var data = opts.data;
    var dataIndex = opts.dataIndex;
    var color = opts.color;
    var el = opts.el;
    var scales = opts.scales;

    var points = el;

    var point = points.selectAll('g').classed('data-point', true)
        .data(data, function(d) {return d.id});

    point.enter()
        .append('g').classed('data-point', true);

    var dataContainer = point.attr('transform', function(d){
            var dataDate = d.date.value;
            var dataX = parseInt(scales.x(dataDate));
            var dataY = parseInt(scales.y(d.y[dataIndex].value))
            var x = dataX;
            var y = that._conf.height - dataY;
            return "translate("+x+","+y+")";
        });

    // dataContainer.append("circle")
    //     .attr("class", "origin")
    //     .attr("r", 2);

    point.exit().remove();

    // draw line
    var valueline = d3.svg.line()
        .x(function(d) {
            var dataDate = d.date.value;
            var dataX = parseInt(scales.x(dataDate));
            return dataX;
        })
        .y(function(d) {
            var dataY = that._conf.height - parseInt(scales.y(d.y[dataIndex].value))
            return dataY;
        });

    var path = d3.selectAll('.data-line-ctr > path').transition().duration(700).attr("d", valueline(data))

};

d3Chart._updateXAxis = function(){
    var maxDataX = this._cache.dateEnd;
    var minDataX = this._cache.dateStart;

    var dS= minDataX;
    var dE= maxDataX;

    var rS= 0 + parseInt(this._cache.deltaWidth_per_dataPoint/2);
    var rE= this._conf.width - parseInt(this._cache.deltaWidth_per_dataPoint/2);

    var AxisScale = d3.time.scale().domain([dS,dE]).range([rS,rE])
    var xAxis = d3.svg.axis()
        .scale(AxisScale)
        .orient("bottom")
        .ticks(this._cache.dataResolutionOnXAxis-1)
        .tickSize(10)
        .tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)) });
        //http://stackoverflow.com/questions/19459687/understanding-nvd3-x-axis-date-format

    d3.select('g.x.axis').call(xAxis);
};


d3Chart._updateYAxis = function(){
    var maxDataY = this._cache.maxDataY;
    var minDataY = this._cache.minDataY;

    var dS= maxDataY + this._cache.headRoom;
    var dE= 0 - this._cache.floorOffset;

    var rS= 0;
    var rE= this._conf.height;

    var AxisScale = d3.scale.linear().domain([dS,dE]).range([rS,rE])

    var yAxis = d3.svg.axis()
        .scale(AxisScale)
        .orient("left")
        //.ticks(this._cache.dataResolutionOnYAxis)
        .tickSize(10)

    d3.select('g.y.axis').call(yAxis);
};


d3Chart._prepareXAxisContainer = function(){
    var axisLocationY = this._conf.height;
    d3.select('g.plot-area').append('g')// Add the X Axis
        .attr("class", "x axis")
        .attr("transform", "translate(0, "+ axisLocationY +")")
};


d3Chart._prepareYAxisContainer = function(){
    var axisLocationY = 0;
    var axisLocationX = 0;
    d3.select('g.plot-area').append('g')
        .attr("class", "y axis")
        .attr("transform", "translate("+axisLocationX+", "+axisLocationY+")")
};


d3Chart._scalesFilteredImpressions = function(data) {
    var that = this;

    var x = this._scale_abscissa(data);

    var dataIndexY = this._conf.dataIndex.unfilteredImpressions;
    var dataY = data.map(function(d){ return d.y[dataIndexY].value; });
    var maxDataY = this._cache.maxDataY;
    var minDataY = this._cache.minDataY;

    var dS_y = 0 - this._cache.floorOffset;
    var dE_y = maxDataY + this._cache.headRoom;
    var rS_y = 0;
    var rE_y = this._conf.height;
    var y = d3.scale.linear().domain([ dS_y, dE_y ]).range([ rS_y, rE_y ]);

    return {x:x, y:y}
};


d3Chart._scalesFilteredClicks = function(data) {
    var that = this;

    var x = this._scale_abscissa(data);

    var dataIndexY = this._conf.dataIndex.unfilteredImpressions;
    var dataY = data.map(function(d){ return d.y[dataIndexY].value; });
    var maxDataY = this._cache.maxDataY;
    var minDataY = this._cache.minDataY;

    var dS_y = 0 - this._cache.floorOffset;
    var dE_y = maxDataY + this._cache.headRoom;
    var rS_y = 0;
    var rE_y = this._conf.height;
    var y = d3.scale.linear().domain([ dS_y, dE_y ]).range([ rS_y, rE_y ]);

    return {x:x, y:y}
}

d3Chart._scalesCtr = function(data) {
    var that = this;

    var x = this._scale_abscissa(data);

    var dataIndexY = this._conf.dataIndex.ctr;
    var dataY = data.map(function(d){ return d.y[dataIndexY].value; });
    var maxDataY = this._cache.data_ctr_max;
    var minDataY = this._cache.data_ctr_min;

    var headRoom_ctr = maxDataY*2;
    var dS_y = 0;
    var dE_y = maxDataY + headRoom_ctr;
    var rS_y = 0;
    var rE_y = this._conf.height;
    var y = d3.scale.linear()
        .domain([ dS_y, dE_y ])
        .range([ rS_y, rE_y ]);

    return {x:x, y:y}
}

d3Chart._scale_abscissa = function() {
    var that = this;

    var dataIndexX = this._conf.dataIndex.unfilteredImpressions;
    var dataX = this._cache.data_dates;
    var maxDataX = this._cache.dateEnd;
    var minDataX = this._cache.dateStart;
    var pointDistance = this._cache.deltaWidth_per_dataPoint;
    var startRangeX = 0 + pointDistance/2;
    var endRangeX   = this._conf.width - pointDistance/2;
    var x = d3.time.scale()
        .domain([minDataX, maxDataX])
        .range([startRangeX, endRangeX]);

    return x;
}

module.exports = d3Chart;
