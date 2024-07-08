import { Flex } from 'antd';
import { Container } from 'reactstrap';
import Palette from 'utils/Palette';

export default function Dashboard() {
	return (
		<Container fluid>
			<div
				style={{ background: Palette.BACKGROUND_DARK_GRAY, color: 'white' }}
				className="card-stats mb-4 mb-xl-0 px-4 py-3"
			>
				<Flex className="mb-1" justify={'space-between'} align={'center'}>
					<div className="mb-3" style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                        Dashboard
                    </div>
				</Flex>
			</div>
		</Container>
	);
}
