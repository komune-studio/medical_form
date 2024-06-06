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

const SCHEDULE_ITEM_PROPERTIES = {
	heightPerMinute: 2.2,
	paddingVertical: 4,
	paddingHorizontal: 8,
};

const X_AXIS_HEADER_HEIGHT = 25;

const Y_AXIS_HEADER_HEIGHT = SCHEDULE_ITEM_PROPERTIES.heightPerMinute * 60;

export default function ScheduleTable({ schedule, setModalSetting }) {
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
		<div
			className="d-flex"
			style={{ width: '100%', height: '100%', flex: 1 }}
		>
			{/* Table y-axis header */}
			<div className="d-flex flex-column">
				{/* Empty space for adjusting y-axis to x-axis */}
				<div
					style={{
						height: X_AXIS_HEADER_HEIGHT,
						marginBottom: 8,
					}}
				></div>
				{/* Loop for getting the y-axis of the table */}
				{OPERATIONAL_HOURS.map((text, index) => (
					<div
						className="d-flex justify-content-center align-items-start font-weight-bold"
						style={{
							height: Y_AXIS_HEADER_HEIGHT,
							padding: '0px 8px',
							fontSize: 14,
							fontWeight: 700,
						}}
						key={index}
					>
						{text}
					</div>
				))}
			</div>

			{getPastWeekDates().map((date, index) => {
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
								textAlign: 'center',
							}}
						>
							{currentDateMoment.format('ddd, DD MMMM YYYY')}
						</div>

						{/* Table contents */}
						<div
							className="d-flex flex-column justify-content-center align-items-center"
							style={{
								padding: '0px 4px',
								border: '2px solid #404040',
								flex: 1,
								position: 'relative',
							}}
							key={index}
						>
							{/* Loop for getting schedule data in current hour */}
							{schedule[currentDate] &&
								schedule[currentDate].map((item) => (
									<ScheduleItem
										key={item.id}
										data={item}
										currentDateMoment={currentDateMoment.set(
											{ hour: 10, minute: 0 }
										)}
										setModalSetting={setModalSetting}
									/>
								))}
						</div>
					</div>
				);
			})}
		</div>
	);
}

function ScheduleItem({ data, currentDateMoment, setModalSetting }) {
	const handleClick = () => {
		if (
			data.skill_level !== 'EVENT' &&
			data.skill_level !== 'MAINTENANCE'
		) {
			setModalSetting({
				isOpen: true,
				isCreateMode: false,
				scheduleId: data.id,
			});
		}
	};

	const startTime = moment(data.start_time);
	console.log(startTime.diff(currentDateMoment, 'minutes'));

	let backgroundColor;
	let color;

	switch (data.skill_level) {
		case 'BEGINNER':
			backgroundColor = '#caffbf';
			color = '#0F5132';
			break;
		case 'ADVANCED':
			backgroundColor = '#fdffb6';
			color = '#664D03';
			break;
		case 'PRO':
			backgroundColor = '#9bf6ff';
			color = '#056676';
			break;
		case 'EVENT':
			backgroundColor = '#D68869';
			color = '#813314';
			break;
		default:
			backgroundColor = '#121212';
			color = Palette.WHITE_GRAY;
	}

	return (
		<div
			className="d-flex justify-content-start align-items-center w-100"
			style={{
				padding: '4px 8px',
				backgroundColor: backgroundColor,
				color: color,
				borderRadius: 2,
				fontSize: 12,
				cursor: 'pointer',
				height:
					SCHEDULE_ITEM_PROPERTIES.heightPerMinute *
					data.duration_minutes,
				position: 'absolute',
				top: startTime.diff(currentDateMoment, 'minutes') * 2.2,
				left: 0,
			}}
			onClick={handleClick}
		>
			<div
				className="d-flex justify-content-start align-items-center w-100"
				style={{ margin: '0px 4px' }}
			>
				<div className="font-weight-bold text-left" style={{ flex: 1 }}>
					{data.skill_level}
				</div>
				<div className="text-center" style={{ flex: 1 }}>
					{startTime.format('HH:mm')}
				</div>
				<div
					className="font-weight-bold text-right"
					style={{ flex: 1 }}
				>
					{data.duration_minutes}&nbsp;minutes
				</div>
			</div>
		</div>
	);
}
