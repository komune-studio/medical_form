import { useState, useEffect } from 'react';
import { Flex, Row, Col, Spin } from 'antd';
import { Container } from 'reactstrap';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { Chart, registerables } from 'chart.js';
import moment from 'moment';
import _ from 'lodash';
import Palette from 'utils/Palette';
import DashboardNumericMetricWidget from './DashboardNumericMetricWidget';
import DashboardColumnChartWidget from './DashboardColumnChartWidget';
import DashboardStackedColumnChartWidget from './DashboardStackedColumnChartWidget';
import DashboardDoughnutChartWidget from './DashboardDoughnutChartWidget';
import DashboardHeatmapWidget from './DashboardHeatmapWidget';
import TopUpHistoryModel from 'models/TopUpHistoryModel';
import OrderModel from 'models/OrderModel';

Chart.register(...registerables);

export default function Dashboard() {
	const [period, setPeriod] = useState('daily');
	const [loading, setLoading] = useState(false);
	const [topUpHistory, setTopUpHistory] = useState([]);
	const [barcoinUsages, setBarcoinUsages] = useState([]);
	const [topUpIncome, setTopUpIncome] = useState();
	const [barcoinTransaction, setBarcoinTransaction] = useState();
	const [topUpIncomeTrend, setTopUpIncomeTrend] = useState({});
	const [barcoinTransactionTrend, setBarcoinTransactionTrend] = useState({});

	const initializeData = async () => {
		try {
			let topUpHistories = await TopUpHistoryModel.getAll();
			setTopUpHistory(topUpHistories);

			let barcoinUsages = await OrderModel.getAllBarcoinUsages();
			setBarcoinUsages(barcoinUsages);
		} catch (e) {
			console.log(e);
		}
	};

	const filterDataByPeriod = () => {
		const today = moment();
		const lastWeek = moment().set({ hour: 0, minute: 0, second: 0 }).subtract(1, 'weeks');
		const lastMonth = moment().set({ hour: 0, minute: 0, second: 0 }).subtract(1, 'months');

		let topUpHistoryFilterResult = [];
		let barcoinUsagesFilterResult = [];
		let topUpIncomeTrendData = {};
		let barcoinTransactionTrendData = {};

		// Filters & groups data by selected time period
		// TODO: 
		switch (period) {
			case 'monthly':
				topUpHistoryFilterResult = topUpHistory.filter(
					(topUp) => moment(topUp.created_at).isBetween(lastMonth, today, []) && topUp.status === 'SUCCESS'
				);
				topUpIncomeTrendData = _.groupBy(topUpHistoryFilterResult, (topUp) => moment(topUp.created_at).week());

				barcoinUsagesFilterResult = barcoinUsages.filter((usage) =>
					moment(usage.created_at).isBetween(lastMonth, today, [])
				);
				barcoinTransactionTrendData = _.groupBy(barcoinUsagesFilterResult, (usage) =>
					moment(usage.created_at).week()
				);

				break;
			case 'weekly':
				topUpHistoryFilterResult = topUpHistory.filter(
					(topUp) => moment(topUp.created_at).isBetween(lastWeek, today, []) && topUp.status === 'SUCCESS'
				);
				topUpIncomeTrendData = _.groupBy(topUpHistoryFilterResult, (topUp) =>
					moment(topUp.created_at).weekday()
				);

				barcoinUsagesFilterResult = barcoinUsages.filter((usage) =>
					moment(usage.created_at).isBetween(lastWeek, today, [])
				);
				barcoinTransactionTrendData = _.groupBy(barcoinUsagesFilterResult, (usage) =>
					moment(usage.created_at).weekday()
				);

				break;
			case 'daily':
			default:
				topUpHistoryFilterResult = topUpHistory.filter(
					(topUp) => today.isSame(moment(topUp.created_at), 'day') && topUp.status === 'SUCCESS'
				);
				topUpIncomeTrendData = _.groupBy(topUpHistoryFilterResult, (topUp) => moment(topUp.created_at).hour());

				barcoinUsagesFilterResult = barcoinUsages.filter((usage) =>
					today.isSame(moment(usage.created_at), 'day')
				);
				barcoinTransactionTrendData = _.groupBy(barcoinUsagesFilterResult, (usage) =>
					moment(usage.created_at).hour()
				);
		}

		// Calculate total top up income & barcoin usages in filtered data
		let totalTopUpIncome = 0;
		let totalBarcoinTransaction = 0;

		if (topUpHistoryFilterResult.length > 0) {
			totalTopUpIncome = topUpHistoryFilterResult.reduce(
				(accumulator, currentData) => accumulator + parseInt(currentData.price || 0),
				totalTopUpIncome
			);
		}

		if (barcoinUsagesFilterResult.length > 0) {
			totalBarcoinTransaction = barcoinUsagesFilterResult.reduce(
				(accumulator, currentData) => accumulator + parseInt(currentData.total_coins || 0),
				totalBarcoinTransaction
			);
		}

		setTopUpIncome(totalTopUpIncome);
		setBarcoinTransaction(totalBarcoinTransaction);

		// Calculta total top up income & barcoin usages in trend data
		let topUpIncomeTrendDataKeys = Object.keys(topUpIncomeTrendData);
		if (topUpIncomeTrendDataKeys.length > 0) {
			for (let keys of topUpIncomeTrendDataKeys) {
				let totalIncome = 0;
				totalIncome = topUpIncomeTrendData[keys].reduce(
					(accumulator, currentData) => accumulator + parseInt(currentData.price || 0),
					totalIncome
				);

				topUpIncomeTrendData[keys] = totalIncome;
			}
		}

		let barcoinTransactionTrendDataKeys = Object.keys(barcoinTransactionTrendData);
		if (barcoinTransactionTrendDataKeys.length > 0) {
			for (let keys of barcoinTransactionTrendDataKeys) {
				let totalTransaction = 0;
				totalTransaction = barcoinTransactionTrendData[keys].reduce(
					(accumulator, currentData) => accumulator + parseInt(currentData.total_coins || 0),
					totalTransaction
				);

				barcoinTransactionTrendData[keys] = totalTransaction;
			}
		}

		setTopUpIncomeTrend(topUpIncomeTrendData);
		setBarcoinTransactionTrend(barcoinTransactionTrendData);
	};

	useEffect(() => {
		setLoading(true);
		initializeData();
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
						<DashboardStackedColumnChartWidget title="Customer Purchasing Behaviour" />
					</Col>
					<Col span={6}>
						<DashboardDoughnutChartWidget title="Slots Available" />
					</Col>
				</Row>
				<Row gutter={24} style={{ marginTop: 24 }}>
					<Col span={24}>
						<DashboardHeatmapWidget title="Peak Hours" />
					</Col>
				</Row>
			</div>
		</Container>
	);
}
