import { Flex } from 'antd';
import Palette from 'utils/Palette';

export default function DashboardWidgetContainer(props) {
	return (
		<Flex
			style={{
				padding: '20px',
				backgroundColor: Palette.BACKGROUND_BLACK,
				borderRadius: 12,
				flex: 1,
			}}
		>
			<Flex gap={16} vertical flex={1}>
				<div style={{ fontSize: 14, fontWeight: 700 }}>{props.title}</div>
				<div style={{ flex: 1 }}>{props.children}</div>
			</Flex>
		</Flex>
	);
}
