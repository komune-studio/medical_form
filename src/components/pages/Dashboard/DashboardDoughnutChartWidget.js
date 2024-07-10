import { useEffect, useRef, useState } from "react"
import { Flex } from "antd"
import { Doughnut } from "react-chartjs-2"
import Palette from "utils/Palette"
import DashboardWidgetContainer from "./DashboardWidgetContainer"

export default function DashboardDoughnutChartWidget(props) {
	const [chartSize, setChartSize] = useState({})
	const containerRef = useRef()

	const chartData = {
		labels: ["Available", "Booked"],
		datasets: [
			{
				label: "Active customer",
				data: [90, 90],
				backgroundColor: [Palette.BARCODE_ORANGE, Palette.LIGHT_GRAY],
				borderRadius: [100, 0],
				borderColor: [Palette.BARCODE_ORANGE, Palette.LIGHT_GRAY]
			}
		]
	}

	const chartOptions = {
		cutout: "90%",
		rotation: 90,
		plugins: {
			legend: {
				dosplay: true,
				position: "bottom",
				labels: {
					usePointStyle: true,
					pointStyleWidth: 15,
					boxWidth: 15,
					boxHeight: 15
				}
			},
		}
	}

	const textCenter = {
		id:"textCenter",
		beforeDatasetsDraw(chart, args, pluginOptions) {
			const { ctx, data} = chart;

			ctx.save();
			
			// Slots text
			ctx.font = 'bolder 16px Helixa';
			ctx.fillStyle = Palette.INACTIVE_GRAY;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText('Slots', chart.getDatasetMeta(0).data[0]?.x, chart.getDatasetMeta(0).data[0]?.y-20)

			// Sum text
			ctx.font = 'bolder 32px Helixa';
			ctx.fillStyle = 'white';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(data.datasets[0].data[0]+data.datasets[0].data[1], chart.getDatasetMeta(0).data[0]?.x, chart.getDatasetMeta(0).data[0]?.y+20)
		}
	}

	useEffect(() => {
		setChartSize({
			height: containerRef.current.clientHeight - 40,
			width: containerRef.current.clientWidth - 40
		})
	}, [containerRef])

	return (
		<DashboardWidgetContainer title={props.title}>
			<Flex flex={1} ref={containerRef}>
				<Doughnut
					data={chartData}
					height={chartSize?.height || 0}
					width={chartSize?.width || 0}
					options={chartOptions}
					plugins={[textCenter]}
				/>
			</Flex>
		</DashboardWidgetContainer>
	)
}
