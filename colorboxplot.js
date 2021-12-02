'use strict';
(function (factory) {
    if (typeof module === 'object' && module.exports) {
        factory['default'] = factory;
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define('highcharts/highcharts-more', ['highcharts'], function (Highcharts) {
            factory(Highcharts);
            factory.Highcharts = Highcharts;
            return factory;
        });
    } else {
        factory(typeof Highcharts !== 'undefined' ? Highcharts : undefined);
    }
}(function (Highcharts) {
	var _modules = Highcharts ? Highcharts._modules : {};
	function _registerModule(obj, path, args, fn) {
		if (!obj.hasOwnProperty(path)) {
			obj[path] = fn.apply(null, args);
		}
	}
	_registerModule(_modules, 'parts-more/EnhanceBoxPlotSeries.js', [_modules['parts/Globals.js'], _modules['parts/Utilities.js']], function (H, U) {
		var pick = U.pick;
		var noop = H.noop, seriesType = H.seriesType, seriesTypes = H.seriesTypes;
		seriesType('enhanceboxplot', 'column', {
			threshold: null,
			tooltip: {
				pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> ' +
				'{series.name}</b><br/>' +
				'Maximum: {point.high}<br/>' +
				'Upper quartile: {point.q3}<br/>' +
				'Median: {point.median}<br/>' +
				'Lower quartile: {point.q1}<br/>' +
				'Minimum: {point.low}<br/>'
			},
			whiskerLength: '50%',
			fillColor: '#ffffff',
			lineWidth: 1,
			medianWidth: 2,
			whiskerWidth: 2
		}, /** @lends Highcharts.seriesTypes.custombxpl */ {
			// array point configs are mapped to this
			pointArrayMap: ['low', 'q1', 'median', 'q3', 'high'],
			// return a plain array for speedy calculation
			toYData: function (point) {
				return [point.low, point.q1, point.median, point.q3, point.high];
			},
			// defines the top of the tracker
			pointValKey: 'high',
			// Get presentational attributes
			pointAttribs: function () {
				// No attributes should be set on point.graphic which is the group
				return {};
			},
			// Disable data labels for box plot
			drawDataLabels: noop,
			// Translate data points from raw values x and y to plotX and plotY
			translate: function () {
				var series = this, yAxis = series.yAxis, pointArrayMap = series.pointArrayMap;
				seriesTypes.column.prototype.translate.apply(series);
				// do the translation on each point dimension
				series.points.forEach(function (point) {
					pointArrayMap.forEach(function (key) {
						if (point[key] !== null) {
							point[key + 'Plot'] = yAxis.translate(point[key], 0, 1, 0, 1);
						}
					});
				});
			},
			drawPoints: function () {
				var series = this,
					points = series.points,
					options = series.options,
					chart = series.chart,
					renderer = chart.renderer,
					q1Plot,
					q3Plot,
					highPlot,
					lowPlot,
					medianPlot,
					medianPath,
					crispCorr,
					crispX = 0,
					boxUpperPath,
					boxLowerPath,
					boxUpperLinePath,
					boxLowerLinePath,
					width,
					left,
					right,
					halfWidth,
					// error bar inherits this series type but doesn't do quartiles
					doQuartiles = series.doQuartiles !== false,
					pointWiskerLength,
					whiskerLength = series.options.whiskerLength;
				points.forEach(function (point) {
					var graphic = point.graphic,
						verb = graphic ? 'animate' : 'attr',
						shapeArgs = point.shapeArgs,
						boxAttrUpper = {},
						boxAttrLower = {},
						boxAttrUpperLine = {},
						boxAttrLowerLine = {},
						stemAttr = {},
						whiskersAttr = {},
						medianAttr = {},
						color = point.color || series.color;
					if (typeof point.plotY !== 'undefined') {
						// crisp vector coordinates
						width = shapeArgs.width;
						left = Math.floor(shapeArgs.x);
						right = left + width;
						halfWidth = Math.round(width / 2);
						q1Plot = Math.floor(doQuartiles ? point.q1Plot : point.lowPlot);
						q3Plot = Math.floor(doQuartiles ? point.q3Plot : point.lowPlot);
						highPlot = Math.floor(point.highPlot);
						lowPlot = Math.floor(point.lowPlot);
						if (!graphic) {
							point.graphic = graphic = renderer.g('point')
								.add(series.group);

							point.stem = renderer.path()
								.addClass('highcharts-boxplot-stem')
								.add(graphic);

							if (whiskerLength) {
								point.whiskers = renderer.path()
									.addClass('highcharts-boxplot-whisker')
									.add(graphic);
							}
							if (doQuartiles) {
								point.boxUpperShape = renderer.path(boxUpperPath)
									.addClass('highcharts-boxplot-box-upper')
									.add(graphic);
								point.boxLowerShape = renderer.path(boxLowerPath)
									.addClass('highcharts-boxplot-box-lower')
									.add(graphic);
								point.boxUpperLineShape = renderer.path(boxUpperLinePath)
									.addClass('highcharts-boxplot-box-line-upper')
									.add(graphic);
								point.boxLowerLineShape = renderer.path(boxLowerLinePath)
									.addClass('highcharts-boxplot-box-line-lower')
									.add(graphic);
							}
							point.medianShape = renderer.path(medianPath)
								.addClass('highcharts-boxplot-median')
								.add(graphic);
						}
						if (!chart.styledMode) {

							// Stem attributes
							stemAttr.stroke =
								point.stemColor || options.stemColor || color;
							stemAttr['stroke-width'] = pick(
								point.stemWidth,
								options.stemWidth,
								options.lineWidth
							);
							stemAttr.dashstyle = (
								point.stemDashStyle ||
								options.stemDashStyle ||
								options.dashStyle
							);
							point.stem.attr(stemAttr);

							// Whiskers attributes
							if (whiskerLength) {
								whiskersAttr.stroke = (
									point.whiskerColor ||
									options.whiskerColor ||
									color
								);
								whiskersAttr['stroke-width'] = pick(
									point.whiskerWidth,
									options.whiskerWidth,
									options.lineWidth
								);
								whiskersAttr.dashstyle = (
									point.whiskerDashStyle ||
									options.whiskerDashStyle ||
									options.dashStyle
								);
								point.whiskers.attr(whiskersAttr);
							}

							if (doQuartiles) {
								// box-upper
								boxAttrUpper.fill = (
									point.fillUpperColor ||
									options.fillUpperColor ||
									point.fillColor ||
									options.fillColor ||
									color
								);
								boxAttrUpper.stroke = options.lineColor || color;
								boxAttrUpper['stroke-width'] = options.lineWidth || 0;
								boxAttrUpper.dashstyle = (
									point.boxDashStyle ||
									options.boxDashStyle ||
									options.dashStyle
								);
								point.boxUpperShape.attr(boxAttrUpper);
								// box-lower
								boxAttrLower.fill = (
									point.fillLowerColor ||
									options.fillLowerColor ||
									point.fillColor ||
									options.fillColor ||
									color
								);
								boxAttrLower.stroke = options.lineColor || color;
								boxAttrLower['stroke-width'] = options.lineWidth || 0;
								boxAttrLower.dashstyle = (
									point.boxDashStyle ||
									options.boxDashStyle ||
									options.dashStyle
								);
								point.boxLowerShape.attr(boxAttrLower);
								// box-upper-line
								boxAttrUpperLine.stroke = (
									point.whiskerColor ||
									point.upperLineColor ||
									options.whiskerColor ||
									options.upperLineColor ||
									options.lineColor ||
									color
								);
								boxAttrUpperLine['stroke-width'] = (
									options.upperLineWidth ||
									options.lineWidth ||
									0
								);
								boxAttrUpperLine.dashstyle = (
									point.lineDashStyle ||
									options.lineDashStyle ||
									options.dashStyle
								);
								point.boxUpperLineShape.attr(boxAttrUpperLine);
								// box-lower-line
								boxAttrLowerLine.stroke = (
									point.whiskerColor ||
									point.lowerLineColor ||
									options.whiskerColor ||
									options.lowerLineColor ||
									options.lineColor ||
									color
								);
								boxAttrLowerLine['stroke-width'] = (
									options.lowerLineWidth ||
									options.lineWidth ||
									0
								);
								boxAttrLowerLine.dashstyle = (
									point.lineDashStyle ||
									options.lineDashStyle ||
									options.dashStyle
								);
								point.boxLowerLineShape.attr(boxAttrLowerLine);
							}

							// Median attributes
							medianAttr.stroke = (
								point.medianColor ||
								options.medianColor ||
								color
							);
							medianAttr['stroke-width'] = pick(
								point.medianWidth,
								options.medianWidth,
								options.lineWidth
							);
							medianAttr.dashstyle = (
								point.medianDashStyle ||
								options.medianDashStyle ||
								options.dashStyle
							);
							point.medianShape.attr(medianAttr);
						}
						// The stem
						crispCorr = (point.stem.strokeWidth() % 2) / 2;
						crispX = left + halfWidth + crispCorr;
						point.stem[verb]({
							d: [
								// stem up
								'M',
								crispX, q3Plot,
								'L',
								crispX, highPlot,
								// stem down
								'M',
								crispX, q1Plot,
								'L',
								crispX, lowPlot
							]
						});
						// The box
						if (doQuartiles) {
							medianPlot = Math.round(point.medianPlot);
							crispCorr = (point.boxUpperShape.strokeWidth() % 2) / 2;
							q1Plot = Math.floor(q1Plot) + crispCorr;
							q3Plot = Math.floor(q3Plot) + crispCorr;
							left += crispCorr;
							right += crispCorr;
							// box-upper
							point.boxUpperShape[verb]({ 
								d: [
									'M', left, q3Plot,
									'L', left, medianPlot,
									'L', right, medianPlot,
									'L', right, q3Plot,
									'L', left, q3Plot,
									'Z'
								] });
							// box-lower
							point.boxLowerShape[verb]({
								d : [
								'M', left, medianPlot,
								'L', left, q1Plot,
								'L', right, q1Plot,
								'L', right, medianPlot,
								'L', left, medianPlot,
								'Z'
							]
							});

							// Upper-line
							point.boxUpperLineShape[verb]({ 
								d:[
									'M', left, q3Plot,
									'L', right, q3Plot,
									'Z'
								] });
							// Lower-line
							point.boxLowerLineShape[verb]({ 
								d : [
									'M', left, q1Plot,
									'L', right, q1Plot,
									'Z'
								]
							});
						}
						// The whiskers
						if (whiskerLength) {
                            crispCorr = (point.whiskers.strokeWidth() % 2) / 2;
                            highPlot = highPlot + crispCorr;
                            lowPlot = lowPlot + crispCorr;
                            pointWiskerLength = (/%$/).test(whiskerLength) ?
                                halfWidth * parseFloat(whiskerLength) / 100 :
                                whiskerLength / 2;
                            point.whiskers[verb]({
								d: [
                                    // High whisker
                                    'M',
                                    crispX - pointWiskerLength,
                                    highPlot,
                                    'L',
                                    crispX + pointWiskerLength,
                                    highPlot,
                                    // Low whisker
                                    'M',
                                    crispX - pointWiskerLength,
                                    lowPlot,
                                    'L',
                                    crispX + pointWiskerLength,
                                    lowPlot
                                ]
                            });
                        }
						// The median
						medianPlot = Math.round(point.medianPlot);
						crispCorr = (point.medianShape.strokeWidth() % 2) / 2;
						medianPlot = medianPlot + crispCorr;

						point.medianShape[verb]({ 
							d: [
							'M', left, medianPlot,
							'L', right, medianPlot,
							'Z'
						] });
					}
				});
			},
			setStackedPoints: noop // #3890
		});
''; // adds doclets above to transpiled file

	});
	_registerModule(_modules, 'masters/highcharts-more.src.js', [], function () {


	});
}));
