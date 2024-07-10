import { Flex, Row, Col } from "antd"
import { Container } from "reactstrap"
import ButtonGroup from "react-bootstrap/ButtonGroup"
import { Link, useLocation } from "react-router-dom"
import { Chart, registerables } from "chart.js"
import Palette from "utils/Palette"
import DashboardNumericMetricWidget from "./DashboardNumericMetricWidget"
import DashboardColumnChartWidget from "./DashboardColumnChartWidget"
import DashboardStackedColumnChartWidget from "./DashboardStackedColumnChartWidget"
import DashboardDoughnutChartWidget from "./DashboardDoughnutChartWidget"
import DashboardHeatmapWidget from "./DashboardHeatmapWidget"

Chart.register(...registerables)

export default function Dashboard() {
	const location = useLocation()
	return (
		<Container fluid>
			<div
				style={{ background: Palette.BACKGROUND_DARK_GRAY, color: "white" }}
				className="card-stats mb-4 mb-xl-0 px-4 py-3"
			>
				<Flex
					justify={"space-between"}
					align={"center"}
					style={{ marginBottom: 32 }}
				>
					<div style={{ fontWeight: "bold", fontSize: "1.1em" }}>Dashboard</div>
					<Row>
						<Col span={12}>
							<ButtonGroup aria-label="Basic example">
								<Link
									className={`btn ${
										location.pathname === "/dashboard"
											? "btn-primary-tab"
											: "btn-default-tab"
									}`}
									to={"/dashboard"}
								>
									Harian
								</Link>
								<Link
									className={`btn ${
										location.pathname === "/#"
											? "btn-primary-tab"
											: "btn-default-tab"
									}`}
									to={"/#"}
								>
									Mingguan
								</Link>
								<Link
									className={`btn ${
										location.pathname === "/#"
											? "btn-primary-tab"
											: "btn-default-tab"
									}`}
									to={"/#"}
								>
									Bulanan
								</Link>
							</ButtonGroup>
						</Col>
					</Row>
				</Flex>
				<Row gutter={24}>
					<Col span={4}>
						<Flex gap={24} vertical style={{ height: "100%" }}>
							<DashboardNumericMetricWidget title={"Today Income"} />
							<DashboardNumericMetricWidget title={"Today Transaction"} />
						</Flex>
					</Col>
					<Col span={10}>
						<DashboardColumnChartWidget title={"Income Trends"} />
					</Col>
					<Col span={10}>
						<DashboardColumnChartWidget title={"Transaction Trends"} />
					</Col>
				</Row>
				<Row gutter={24} style={{ marginTop: 24 }}>
					<Col span={18} style={{ height: "100%" }}>
						<DashboardStackedColumnChartWidget title="Customer Purchasing Behaviour" />
					</Col>
					<Col span={6} style={{ height: "100%" }}>
						<DashboardDoughnutChartWidget title="Slots Available" />
					</Col>
				</Row>
				<Row gutter={24} style={{ marginTop: 24 }}>
					<Col span={24} style={{ height: "100%" }}>
						<DashboardHeatmapWidget title="Peak Hours" />
					</Col>
				</Row>
			</div>
		</Container>
	)
}
