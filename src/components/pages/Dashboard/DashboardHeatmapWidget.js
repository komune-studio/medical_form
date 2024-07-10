import { useEffect, useRef, useState } from "react"
import { Flex } from "antd"
import Palette from "utils/Palette"
import DashboardWidgetContainer from "./DashboardWidgetContainer"
import { HeatMapGrid } from "react-grid-heatmap"

export default function DashboardHeatmapWidget(props) {
	const [chartSize, setChartSize] = useState({ height: 325 })
	const containerRef = useRef()

	const xLabels = new Array(12).fill(0).map((_, i) => `${i+9}`)
	const yLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
	const data = new Array(yLabels.length)
		.fill(0)
		.map(() =>
			new Array(xLabels.length)
				.fill(0)
				.map(() => Math.floor(Math.random() * 50 + 50))
		)

	useEffect(() => {
		setChartSize({
			height: containerRef.current.clientHeight - 40,
			width: containerRef.current.clientWidth - 40
		})
	}, [containerRef])

	return (
		<DashboardWidgetContainer title={props.title}>
			<Flex flex={1} ref={containerRef}>
				<HeatMapGrid
					data={data}
					xLabels={xLabels}
					yLabels={yLabels}
					cellRender={(x, y, value) => (
						<div title={`Pos(${x}, ${y}) = ${value}`}>&nbsp;</div>
					)}
					xLabelsStyle={(index) => ({
						color: Palette.INACTIVE_GRAY,
						fontSize: ".8rem",
						paddingTop: '10px'
					})}
					yLabelsStyle={() => ({
						fontSize: ".7rem",
						color: Palette.INACTIVE_GRAY,
						paddingRight: '10px'
					})}
					cellStyle={(_x, _y, ratio) => ({
						background: `rgb(139, 15, 6, ${ratio})`,
						fontSize: ".8rem",
						color: `rgb(255, 255, 255, ${ratio / 2 + 0.4})`,
						width: "7.5rem",
						border: "none",
						borderRadius: 0,
					})}
					cellHeight="2.5rem"
					xLabelsPos="bottom"
					onClick={(x, y) => alert(`Clicked (${x}, ${y})`)}
					yLabelsPos="left"
				/>
			</Flex>
		</DashboardWidgetContainer>
	)
}
