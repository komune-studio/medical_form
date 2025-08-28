//import {UserListHead, UserListToolbar} from "../../sections/@dashboard/user";
import {
	Box,
	Checkbox,
	OutlinedInput,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TableSortLabel,
	Toolbar,
	Typography,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { filter } from 'lodash';
import { useEffect, useState } from 'react';
import ListTableToolbar from './ListTableToolbar';
import Palette from '../../utils/Palette';

function applySortFilter(array, comparator, query, columns) {
	if (!array) return [];
	const stabilizedThis = array.map((el, index) => [el, index]);
	stabilizedThis.sort((a, b) => {
		const order = comparator(a[0], b[0]);
		if (order !== 0) return order;
		return a[1] - b[1];
	});
	if (query) {
		return filter(array, (obj) => {
			for (let c of columns) {
				if (c.filter && obj) {
					if (!obj[c.id]) {
						continue;
					}
					if (!obj[c.id].toLowerCase) {
						continue;
					}
					if (obj[c.id]?.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
						return true;
					}
				}
			}
			return false;
		});
	}
	return stabilizedThis.map((el) => el[0]);
}

function getComparator(order, orderBy) {
	return order === 'desc'
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy);
}

function descendingComparator(a, b, orderBy) {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

const visuallyHidden = {
	border: 0,
	margin: -1,
	padding: 0,
	width: '1px',
	height: '1px',
	overflow: 'hidden',
	position: 'absolute',
	whiteSpace: 'nowrap',
	clip: 'rect(0 0 0 0)',
};

const StyledRoot = styled(Toolbar)(({ theme }) => ({
	height: 96,
	display: 'flex',
	justifyContent: 'space-between',
	padding: theme.spacing(0, 1, 0, 3),
}));

const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
	width: 240,
	transition: theme.transitions.create(['box-shadow', 'width'], {
		easing: theme.transitions.easing.easeInOut,
		duration: theme.transitions.duration.shorter,
	}),
	'&.Mui-focused': {
		width: 320,
		boxShadow: theme.customShadows.z8,
	},
	'& fieldset': {
		borderWidth: `1px !important`,
		borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`,
	},
}));

const CustomTable = ({
	data,
	columns,
	checkbox = false,
	searchText,
	pagination = true,
	showFilter = false,
	mode = 'dark',
	extendToolbar = null,
	defaultOrder = null,
	rowAction,
}) => {
	const [selected, setSelected] = useState([]);
	const [order, setOrder] = useState('desc');
	const [orderBy, setOrderBy] = useState('name');
	const [filterName, setFilterName] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	useEffect(() => {
		if (columns && columns.length > 0) {
			if (defaultOrder) {
				setOrderBy(defaultOrder);
			} else {
				setOrderBy(columns[0].id);
			}
		}
	}, [columns]);

	const handleFilterByName = (event) => {
		setPage(0);
		setFilterName(event.target.value);
	};

	const filteredData = applySortFilter(data, getComparator(order, orderBy), filterName, columns);
	const handleRequestSort = (event, property) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const createSortHandler = (property) => (event) => {
		handleRequestSort(event, property);
	};

	const handleSelectAllClick = (event) => {
		if (event.target.checked) {
			const newSelecteds = data.map((n) => n.id);
			setSelected(newSelecteds);
			return;
		}
		setSelected([]);
	};

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setPage(0);
		setRowsPerPage(parseInt(event.target.value, 10));
	};

	const handleClick = (event, name) => {
		const selectedIndex = selected.indexOf(name);
		let newSelected = [];
		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, name);
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
		}
		setSelected(newSelected);
	};

	const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

	const isNotFound = !filteredData.length && !!filterName;

	return (
		<>
			{showFilter && (
				<ListTableToolbar
					numSelected={selected.length}
					filterName={filterName}
					onFilterName={handleFilterByName}
					extendToolbar={extendToolbar}
				/>
			)}

			<TableContainer sx={{ minWidth: 0, fontFamily: 'Open Sans' }}>
				<Table>
					<TableHead>
						<TableRow>
							{checkbox && (
								<TableCell padding="checkbox">
									<Checkbox
										indeterminate={selected.length > 0 && selected.length < data.length}
										checked={data.length > 0 && selected.length === data.length}
										onChange={handleSelectAllClick}
									/>
								</TableCell>
							)}
							{columns.map((headCell) => (
								<TableCell
									width={headCell?.width}
									style={{ color: mode === 'dark' ? 'white' : 'black' }}
									scope="row"
									component={'th'}
									key={headCell.id}
									align={headCell.alignment ? headCell.alignment : 'left'}
									sortDirection={orderBy === headCell.id ? order : false}
								>
									<TableSortLabel
										style={{ color: mode === 'dark' ? 'white' : 'black' }}
										hideSortIcon
										active={orderBy === headCell.id}
										direction={orderBy === headCell.id ? order : 'asc'}
										onClick={(e) => {
											if (headCell.allowSort || headCell.allowSort == undefined) {
												createSortHandler(headCell.id)(e)
											}
										}}
										sx={{
											'& .MuiTableSortLabel-icon': {
												color: `${Palette.MAIN_THEME} !important`
											}
										}}
									>
										{headCell.label}
										{orderBy === headCell.id ? (
											<Box sx={{ ...visuallyHidden }}>
												{order === 'desc' ? 'sorted descending' : 'sorted ascending'}
											</Box>
										) : null}
									</TableSortLabel>
								</TableCell>
							))}
						</TableRow>
					</TableHead>

					<TableBody>
						{filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, key) => {
							const { id } = row;
							const selectedItem = selected.indexOf(id) !== -1;

							return (
								<TableRow
									hover
									key={id}
									tabIndex={-1}
									role="checkbox"
									selected={selectedItem}
									style={{ cursor: rowAction?.onClick ? 'pointer' : 'default' }}
								>
									{checkbox && (
										<TableCell padding="checkbox">
											<Checkbox
												checked={selectedItem}
												onChange={(event) => handleClick(event, id)}
											/>
										</TableCell>
									)}

									{columns.map((columnSetting, key) => {
										return (
											<>
												<TableCell
													style={{ color: mode === 'dark' ? 'white' : 'black' }}
													onClick={columnSetting.link ? () => rowAction?.onClick(row) : null}
													align={columnSetting.alignment}
												>
													{columnSetting.render
														? columnSetting.render(row)
														: row[columnSetting.id]
															? row[columnSetting.id]
															: '-'}
												</TableCell>
											</>
										);
									})}
								</TableRow>
							);
						})}
						{emptyRows > 0 && (
							<TableRow style={{ height: 53 * emptyRows }}>
								<TableCell colSpan={6} />
							</TableRow>
						)}
					</TableBody>

					{isNotFound && (
						<TableBody>
							<TableRow>
								<TableCell align="center" colSpan={6} sx={{ py: 3 }}>
									<Paper
										sx={{
											textAlign: 'center',
											backgroundColor: 'transparent',
											fontFamily: 'Open Sans',
										}}
									>
										<Typography variant="h6" paragraph>
											Data Tidak Ditemukan
										</Typography>

										<Typography variant="body2">
											Tidak ada data ditemukan untuk &nbsp;
											<strong>&quot;{filterName}&quot;</strong>.
											<br /> Periksa nama barang atau coba dengan kata kunci lain
										</Typography>
									</Paper>
								</TableCell>
							</TableRow>
						</TableBody>
					)}
				</Table>
			</TableContainer>

			{pagination && (
				<TablePagination
					rowsPerPageOptions={[10, 25, 50, 100]}
					component="div"
					classes={'flex'}
					count={data.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					sx={{
						color: Palette.WHITE,
						'& .MuiTablePagination-root': {
							color: Palette.WHITE,
						},
					}}
					slotProps={{
						select: {
							sx: {
								'& .MuiSelect-icon': {
									color: Palette.WHITE, // Change this to your desired color
								},
							},
						},
						actions: { nextButtonIcon: { '&.Mui-disabled': { color: Palette.WHITE } } },
					}}
				/>
			)}
		</>
	);
};

export default CustomTable;
