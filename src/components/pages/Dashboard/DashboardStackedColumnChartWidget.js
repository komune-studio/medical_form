import { useEffect, useRef, useState } from "react"
import { Flex } from "antd"
import { Bar } from "react-chartjs-2"
import Palette from "utils/Palette"
import DashboardWidgetContainer from "./DashboardWidgetContainer"

export default function DashboardStackedColumnChartWidget(props) {
	const [chartSize, setChartSize] = useState({})
	const containerRef = useRef()

	const chartData = {
		labels: [
			"January",
			"January",
			"January",
			"January",
			"January",
			"January",
			"January"
		],
		datasets: [
			{
				label: "Active customer",
				data: [65, 59, 80, 81, 56, 55, 40],
				backgroundColor: new Array(7).fill(Palette.BARCODE_ORANGE),
				borderRadius: 4
			},
			{
				label: "New customer",
				data: [65, 59, 80, 81, 56, 55, 40],
				backgroundColor: new Array(7).fill(Palette.BARCODE_GRAY),
				borderRadius: 4
			},
			{
				label: "Returned customer",
				data: [65, 59, 80, 81, 56, 55, 40],
				backgroundColor: new Array(7).fill(Palette.BARCODE_BLUE),
				borderRadius: 4
			}
		]
	}

	const chartOptions = {
		barThickness: 24,
		scales: {
			x: {
				stacked: true
			},
			y: {
				stacked: true
			}
		},
		plugins: {
			legend: {
				dosplay: true,
				position: "right",
				labels: {
					usePointStyle: true,
					pointStyleWidth: 15,
					boxWidth: 15,
					boxHeight: 15
				},
			},
			title: {
				display: true,
				position: "top",
				align: "start",
				text: "Customer Transaction Value"
			}
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
				<Bar
					data={chartData}
					height={chartSize?.height || 0}
					width={chartSize?.width || 0}
					options={chartOptions}
				/>
			</Flex>
		</DashboardWidgetContainer>
	)
}
