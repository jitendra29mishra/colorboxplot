
Highcharts.chart('container', {
	plotOptions: {
		enhanceboxplot: {
			fillUpperColor: "#e2e2e2",
			fillLowerColor: "#b8b7b7",
			upperLineColor: "#939393",
			lowerLineColor: "#939393",
			stemColor: "#8d8d8d",
			whiskerColor: "#505050",
			upperLineWidth: 1,
			lowerLineWidth: 1,
			lineWidth: 0,
			stemWidth: 1,
			medianWidth: 0,
			whiskerWidth: 1,
		}
	},
	series: [
		{
			type: 'enhanceboxplot',
			data: [
				[10, 30, 50, 60, 100],
				[20, 40, 55, 65, 80],
				{
					low: 2,
					q1:30,
					median:50,
					q3:95,
					high:140, 
					fillUpperColor: "#94a7fa",
					fillLowerColor: "#a9b8fa"
				},
				[20, 40, 55, 65, 80],
				[-30, 20, 75, 85, 120],
			]
		}, {
			type: "scatter",
			color: "#1f77b4",
			data: [
				[0, 120],
				[0, 100],
				[0, -5],
				[1, 120],
				[1, 100],
				[1, 15],
				[2, 150],
				[2, 165],
				[2, -29],
				[3, 130],
				[3, 110],
				[3, 12],
				[4, 130],
				[4, 135],
				[4, -40],
			]
		}
	]
})
