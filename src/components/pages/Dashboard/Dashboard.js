import { useState, useEffect } from 'react';
import { Flex, Row, Col, Spin } from 'antd';
import { Container } from 'reactstrap';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { Chart, registerables } from 'chart.js';
import moment from 'moment';
import _ from 'lodash';
import Palette from 'utils/Palette';
import Helper from 'utils/Helper';
import DashboardNumericMetricWidget from './DashboardNumericMetricWidget';
import DashboardColumnChartWidget from './DashboardColumnChartWidget';
import DashboardStackedColumnChartWidget from './DashboardStackedColumnChartWidget';
import DashboardDoughnutChartWidget from './DashboardDoughnutChartWidget';
import DashboardHeatmapWidget from './DashboardHeatmapWidget';
import { arraySum, calculateHeatMap, calculateTrends } from './DashboardStatisticUtils';
import TopUpHistoryModel from 'models/TopUpHistoryModel';
import OrderModel from 'models/OrderModel';
import ScheduleModel from 'models/ScheduleModel';

Chart.register(...registerables);

export default function Dashboard() {
	const [period, setPeriod] = useState('daily');
	const [loading, setLoading] = useState(false);
	const [topUpHistory, setTopUpHistory] = useState([]);
	const [barcoinUsages, setBarcoinUsages] = useState([]);
	const [schedules, setSchedules] = useState([]);
	const [slots, setSlots] = useState({});
	const [heatMap, setHeatMap] = useState([]);
	const [topUpIncome, setTopUpIncome] = useState();
	const [barcoinTransaction, setBarcoinTransaction] = useState();
	const [topUpIncomeTrend, setTopUpIncomeTrend] = useState({});
	const [barcoinTransactionTrend, setBarcoinTransactionTrend] = useState({});

	const getTopUpHistoryAndBarcoinUsagesData = async () => {
		try {
			let topUpHistories = await TopUpHistoryModel.getAll();
			setTopUpHistory(topUpHistories);

			let barcoinUsages = await OrderModel.getAllBarcoinUsages();
			setBarcoinUsages(barcoinUsages);
		} catch (e) {
			console.log(e);
		}
	};

	const filterDataByPeriod = async () => {
		const today = moment();
		const startOfDay = moment().startOf('day');
		const endOfDay = moment().endOf('day');
		const startOfWeek = moment().startOf('week');
		const endOfWeek = moment().endOf('week');
		const startOfMonth = moment().startOf('month');
		const endOfMonth = moment().endOf('month');

		let keys = [];
		let topUpHistoryFilterResult = [];
		let barcoinUsagesFilterResult = [];
		let scheduleData = [];

		// NOTE: Read note in line 17 of DashboardStatisticUtils.js
		let trendGroupingKeyExtractor = (item) => moment(item.created_at).format('HH');
		let heatMapOuterGroupingKeyExtractor = (item) => moment(item.start_time).format('dddd');
		let heatMapInnerGroupingKeyExtractor = (item) => moment(item.start_time).format('HH');

		switch (period) {
			case 'monthly':
				topUpHistoryFilterResult = topUpHistory.filter(
					(topUp) =>
						moment(topUp.created_at).isBetween(startOfMonth, endOfMonth, []) && topUp.status === 'SUCCESS'
				);

				barcoinUsagesFilterResult = barcoinUsages.filter((usage) =>
					moment(usage.created_at).isBetween(startOfMonth, endOfMonth, [])
				);

				scheduleData = await ScheduleModel.getAllInTimeRange({
					start_time: startOfMonth,
					end_time: endOfMonth,
				});

				trendGroupingKeyExtractor = (item) => moment(item.created_at).week();
				heatMapOuterGroupingKeyExtractor = (item) => moment(item.start_time).week();
				heatMapInnerGroupingKeyExtractor = (item) => moment(item.start_time).format('dddd');
				break;
			case 'weekly':
				topUpHistoryFilterResult = topUpHistory.filter(
					(topUp) =>
						moment(topUp.created_at).isBetween(startOfWeek, endOfWeek, []) && topUp.status === 'SUCCESS'
				);

				barcoinUsagesFilterResult = barcoinUsages.filter((usage) =>
					moment(usage.created_at).isBetween(startOfWeek, endOfWeek, [])
				);

				scheduleData = await ScheduleModel.getAllInTimeRange({
					start_time: startOfWeek,
					end_time: endOfWeek,
				});

				trendGroupingKeyExtractor = (item) => moment(item.created_at).format('dddd');
				break;
			case 'daily':
			default:
				topUpHistoryFilterResult = topUpHistory.filter(
					(topUp) => today.isSame(moment(topUp.created_at), 'day') && topUp.status === 'SUCCESS'
				);

				barcoinUsagesFilterResult = barcoinUsages.filter((usage) =>
					today.isSame(moment(usage.created_at), 'day')
				);

				scheduleData = await ScheduleModel.getAllInTimeRange({
					start_time: startOfDay,
					end_time: endOfDay,
				});
		}

		// Calculate total top up income & barcoin transaction
		let totalTopUpIncome = arraySum(
			topUpHistoryFilterResult,
			(accumulator, currentData) => accumulator + parseInt(currentData.price || 0)
		);

		let totalBarcoinTransaction = arraySum(
			barcoinUsagesFilterResult,
			(accumulator, currentData) => accumulator + parseInt(currentData.total_coins || 0)
		);

		// Calculate top up income & barcoin transaction trends data
		let topUpIncomeTrendResult = calculateTrends({
			filteredData: topUpHistoryFilterResult,
			groupingKeyExtractor: trendGroupingKeyExtractor,
			accumulatorFunction: (accumulator, currentData) => accumulator + parseInt(currentData.price || 0),
			period: period,
		});

		let barcoinTransactionTrendResult = calculateTrends({
			filteredData: barcoinUsagesFilterResult,
			groupingKeyExtractor: trendGroupingKeyExtractor,
			accumulatorFunction: (accumulator, currentData) => accumulator + parseInt(currentData.total_coins || 0),
			period: period,
		});

		// Calculate slots data
		let totalSlots = 0;
		let bookedSlots = 0;

		for (let schedule of scheduleData) {
			totalSlots += schedule.available_slots - schedule._count.schedule_slot_user;
			bookedSlots += schedule._count.schedule_slot_user;
		}

		// Calculate heat map data
		let heatMap = calculateHeatMap({
			filteredData: scheduleData,
			outerGroupingKeyExtractor: heatMapOuterGroupingKeyExtractor,
			innerGroupingKeyExtractor: heatMapInnerGroupingKeyExtractor,
			accumulatorFunction: (accumulator, currentData) => accumulator + currentData._count.schedule_slot_user || 0,
			period: period,
		});

		setSchedules(scheduleData);
		setSlots({ total_slots: totalSlots, booked_slots: bookedSlots });
		setHeatMap(heatMap);
		setTopUpIncome(totalTopUpIncome);
		setBarcoinTransaction(totalBarcoinTransaction);
		setTopUpIncomeTrend(topUpIncomeTrendResult);
		setBarcoinTransactionTrend(barcoinTransactionTrendResult);
	};

	useEffect(() => {
		setLoading(true);
		getTopUpHistoryAndBarcoinUsagesData();
	}, [period]);

	useEffect(() => {
		filterDataByPeriod();
		setLoading(false);
	}, [topUpHistory, barcoinUsages, period]);

	if (loading) {
		return (
			<Container fluid>
				<Flex flex={1} justify="center" align="center" style={{ height: '100%', width: '100%' }}>
					<Spin size="large" />
				</Flex>
			</Container>
		);
	}

	return (
		<Container fluid>
			<div
				style={{ background: Palette.BACKGROUND_DARK_GRAY, color: 'white' }}
				className="card-stats mb-4 mb-xl-0 px-4 py-3"
			>
				<Flex justify={'space-between'} align={'center'} style={{ marginBottom: 32 }}>
					<div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>Dashboard</div>
					<Row>
						<Col span={12}>
							<ButtonGroup aria-label="Basic example">
								<div
									className={`btn ${period === 'daily' ? 'btn-primary-tab' : 'btn-default-tab'}`}
									onClick={() => setPeriod('daily')}
								>
									Harian
								</div>
								<div
									className={`btn ${period === 'weekly' ? 'btn-primary-tab' : 'btn-default-tab'}`}
									onClick={() => setPeriod('weekly')}
								>
									Mingguan
								</div>
								<div
									className={`btn ${period === 'monthly' ? 'btn-primary-tab' : 'btn-default-tab'}`}
									onClick={() => setPeriod('monthly')}
								>
									Bulanan
								</div>
							</ButtonGroup>
						</Col>
					</Row>
				</Flex>
				<Row gutter={24}>
					<Col span={4}>
						<Flex gap={24} vertical style={{ height: '100%' }}>
							<DashboardNumericMetricWidget title={'Top Up Income'} mainNumber={topUpIncome} />
							<DashboardNumericMetricWidget
								title={'Barcoins Transaction'}
								mainNumber={barcoinTransaction}
							/>
						</Flex>
					</Col>
					<Col span={10}>
						<DashboardColumnChartWidget title={'Top Up Income Trends'} data={topUpIncomeTrend} />
					</Col>
					<Col span={10}>
						<DashboardColumnChartWidget
							title={'Barcoin Transaction Trends'}
							data={barcoinTransactionTrend}
						/>
					</Col>
				</Row>
				<Row gutter={24} style={{ marginTop: 24 }}>
					<Col span={18}>
						{heatMap.result && <DashboardHeatmapWidget title="Schedule Heat Map" data={heatMap} />}
					</Col>
					<Col span={6}>
						<DashboardDoughnutChartWidget title="Slots Available" data={slots} />
					</Col>
				</Row>
			</div>
		</Container>
	);
}
