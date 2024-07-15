import { useEffect, useRef, useState } from "react"
import { Flex } from "antd"
import Palette from "utils/Palette"
import DashboardWidgetContainer from "./DashboardWidgetContainer"
import { HeatMapGrid } from "react-grid-heatmap"

export default function DashboardHeatmapWidget(props) {
	const [chartSize, setChartSize] = useState({ height: 325 })
	const containerRef = useRef()

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
					data={props.data.result}
					xLabels={props.data.innerKeys}
					yLabels={props.data.outerKeys}
					cellRender={(x, y, value) => (
						<div title={`Pos(${x}, ${y}) = ${value}`}>{value}</div>
					)}
					xLabelsStyle={(index) => ({
						color: Palette.INACTIVE_GRAY,
						fontSize: ".8rem",
						paddingTop: 10,
					})}
					yLabelsStyle={() => ({
						fontSize: ".7rem",
						color: Palette.INACTIVE_GRAY,
						paddingRight: 10
					})}
					cellStyle={(_x, _y, ratio) => ({
						background: `rgb(239, 96, 36, ${ratio + 0.08})`,
						fontSize: ".8rem",
						color: `rgb(255, 255, 255, ${ratio / 2 + 0.4})`,
						width: "5.3rem",
						border: "none",
						borderRadius: 0,
					})}
					cellHeight="2.5rem"
					xLabelsPos="bottom"
					onClick={(x, y) => null}
					yLabelsPos="left"
				/>
			</Flex>
		</DashboardWidgetContainer>
	)
}
