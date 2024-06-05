import moment from 'moment';
import Palette from 'utils/Palette';

const OPERATIONAL_HOURS = [
	'10.00',
	'11.00',
	'12.00',
	'13.00',
	'14.00',
	'15.00',
	'16.00',
	'17.00',
	'18.00',
	'19.00',
	'20.00',
	'21.00',
	'22.00',
];

const X_AXIS_HEADER_HEIGHT = 25;

const Y_AXIS_HEADER_HEIGHT = 172;

export default function ScheduleTable({ schedule }) {
	const getPastWeekDates = () => {
		const result = [];
		for (let i = 0; i < 7; i++) {
			let date = new Date();
			date.setDate(date.getDate() - i);
			result.push(date);
		}

		return result;
	};

	return (
		<div className="d-flex" style={{ width: '100%', height: '100%', flex: 1 }}>
			<ScheduleTableYAxis />
			<ScheduleTableXAxis
				dates={getPastWeekDates()}
				schedule={schedule}
			/>
		</div>
	);
}

function ScheduleTableYAxis() {
	return (
		<div className="d-flex flex-column">
			<div
				style={{
					height: X_AXIS_HEADER_HEIGHT,
					marginBottom: 8,
				}}
			></div>
			{/* Loop for getting the y-axis of the table (every hour in a day) */}
			{OPERATIONAL_HOURS.map((text, index) => (
				<div
					className="d-flex justify-content-center align-items-start font-weight-bold"
					style={{
                        height: Y_AXIS_HEADER_HEIGHT,
						padding: '2px 4px',
						marginRight: 12,
						fontSize: 12,
						fontWeight: 700,
					}}
					key={index}
				>
					{text}
				</div>
			))}
		</div>
	);
}

function ScheduleTableXAxis({ dates, schedule }) {
	return (
		<>
			{dates.map((date, index) => {
				const currentDateMoment = moment(date);
				const currentDate = currentDateMoment
					.format('DD/MM/YYYY')
					.toString();

				return (
					<div
						className="d-flex flex-column"
						style={{
							flex: 1,
						}}
						key={index}
					>
						{/* X-axis header */}
						<div
							className="d-flex align-items-center justify-content-center"
							style={{
								fontSize: 14,
								fontWeight: 700,
								color: Palette.INACTIVE_GRAY,
								height: X_AXIS_HEADER_HEIGHT,
								marginBottom: 8,
							}}
						>
							{currentDateMoment.format('dddd, DD MMMM YYYY')}
						</div>

						{/* Table contents */}
						<ScheduleTableContent
							currentDate={currentDate}
							schedule={schedule[currentDate] || null}
						/>
					</div>
				);
			})}
		</>
	);
}

function ScheduleTableContent({ currentDate, schedule }) {
	return (
		<>
			{/* Loop for getting schedule data from each hour in current date  */}
			{OPERATIONAL_HOURS.map((currentHour, index) => {
				return (
					<div
						className="d-flex flex-column"
						style={{
							gap: 8,
							padding: '4px 4px',
							border: '1px solid #404040',
							flex: 1,
						}}
						key={index}
					>
						{/* Loop for getting schedule data in current hour */}
						{schedule && (
							<ScheduleTableContentPerHour
								schedule={schedule[currentHour] || null}
							/>
						)}
					</div>
				);
			})}
		</>
	);
}

function ScheduleTableContentPerHour({ schedule }) {
	if (!schedule) return null;

	return (
		<div>
			{schedule.map((item, index) => (
				<ScheduleItem
					key={index}
					backgroundColor={'#D1E7DD'}
					color={'#0F5132'}
					// setModalSetting={setModalSetting}
				/>
			))}
		</div>
	);
}

function ScheduleItem(props) {
	return (
		<div
			className="d-flex justify-content-between align-items-center"
			style={{
				padding: '4px 8px',
				backgroundColor: props.backgroundColor,
				color: props.color,
				borderRadius: 24,
				fontSize: 10,
				cursor: 'pointer',
			}}
			onClick={() =>
				props.setModalSetting({
					isOpen: true,
					isCreateMode: false,
					scheduleId: 1,
				})
			}
		>
			<div className="font-weight-bold">Beginner</div>
			<div>4 slot(s) available</div>
		</div>
	);
}
