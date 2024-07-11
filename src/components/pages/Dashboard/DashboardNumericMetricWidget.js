import { Flex } from 'antd';
import Iconify from 'components/reusable/Iconify';
import Palette from 'utils/Palette';
import Helper from 'utils/Helper';
import DashboardWidgetContainer from './DashboardWidgetContainer';

export default function DashboardNumericMetricWidget(props) {
	return (
		<DashboardWidgetContainer title={props.title}>
			<Flex flex={1} gap={12} justify={'center'} vertical style={{ height: '100%' }}>
				<div style={{ fontSize: 20, fontWeight: 700 }}>IDR {Helper.formatNumber(props.mainNumber || 0)}</div>
				<Flex gap={8} align={'center'}>
					<Flex
						justify={'center'}
						align={'center'}
						style={{ padding: 2, backgroundColor: '#FFFFFF14', borderRadius: 99 }}
					>
						<Iconify icon={'mdi:trending-up'} width={16} height={16} color={'#3894F3'} />
					</Flex>
					<div style={{ color: Palette.INACTIVE_GRAY, fontWeight: 600 }}>+##% than Yesterday</div>
				</Flex>
			</Flex>
		</DashboardWidgetContainer>
	);
}
