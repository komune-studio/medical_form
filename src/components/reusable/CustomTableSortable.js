//import {UserListHead, UserListToolbar} from "../../sections/@dashboard/user";
import Scrollbar from "../scrollbar/Scrollbar"
import {
	Avatar,
	Box,
	Checkbox,
	IconButton,
	InputAdornment,
	OutlinedInput,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TableSortLabel,
	Toolbar,
	Typography
} from "@mui/material"
import moment from "moment/moment"
import Iconify from "../iconify"
import { useEffect, useState } from "react"
import { filter } from "lodash"
import { alpha, styled } from "@mui/material/styles"
import ListTableToolbar from "./ListTableToolbar"
import {
	DragDropContext,
	Droppable,
	Draggable,
	DropResult,
	ResponderProvided,
	DraggableProvided,
	DroppableProvided,
	DraggableStateSnapshot
} from "react-beautiful-dnd"
import { Flex, Button as AntButton } from "antd"
import TournamentModel from "models/TournamentModel"
import swal from "components/reusable/CustomSweetAlert"

function applySortFilter(array, comparator, query, columns) {
	if (!array) return []
	const stabilizedThis = array.map((el, index) => [el, index])
	stabilizedThis.sort((a, b) => {
		const order = comparator(a[0], b[0])
		if (order !== 0) return order
		return a[1] - b[1]
	})
	if (query) {
		return filter(array, (obj) => {
			for (let c of columns) {
				if (c.filter && obj) {
					if (!obj[c.id]) {
						continue
					}
					if (!obj[c.id].toLowerCase) {
						continue
					}
					if (obj[c.id]?.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
						return true
					}
				}
			}
			return false
		})
	}
	return stabilizedThis.map((el) => el[0])
}

function getComparator(order, orderBy) {
	return order === "desc"
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy)
}

function descendingComparator(a, b, orderBy) {
	if (b[orderBy] < a[orderBy]) {
		return -1
	}
	if (b[orderBy] > a[orderBy]) {
		return 1
	}
	return 0
}

const visuallyHidden = {
	border: 0,
	margin: -1,
	padding: 0,
	width: "1px",
	height: "1px",
	overflow: "hidden",
	position: "absolute",
	whiteSpace: "nowrap",
	clip: "rect(0 0 0 0)"
}

const StyledRoot = styled(Toolbar)(({ theme }) => ({
	height: 96,
	display: "flex",
	justifyContent: "space-between",
	padding: theme.spacing(0, 1, 0, 3)
}))

const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
	width: 240,
	transition: theme.transitions.create(["box-shadow", "width"], {
		easing: theme.transitions.easing.easeInOut,
		duration: theme.transitions.duration.shorter
	}),
	"&.Mui-focused": {
		width: 320,
		boxShadow: theme.customShadows.z8
	},
	"& fieldset": {
		borderWidth: `1px !important`,
		borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`
	}
}))

const CustomTableSortable = ({
	data,
	columns,
	checkbox = false,
	searchText,
	pagination = false,
	showFilter = false,
	mode = "dark",
	extendToolbar = false,
	defaultOrder = null,
	rowAction,
	title
}) => {
	const [sortedData, setSortedData] = useState(
		applySortFilter(data, getComparator("asc", "index_sort"), "", columns)
	)
	const [customColumns, setCustomColumns] = useState(columns)
	const [selected, setSelected] = useState([])
	const [order, setOrder] = useState("desc")
	const [orderBy, setOrderBy] = useState("name")
	const [filterName, setFilterName] = useState("")
	const [page, setPage] = useState(0)
	const [rowsPerPage, setRowsPerPage] = useState(10)

	const [sortDriverPlacement, setSortDriverPlacement] = useState(false)

	useEffect(() => {
		if (columns && columns.length > 0) {
			if (defaultOrder) {
				setOrderBy(defaultOrder)
			} else {
				setOrderBy(columns[0].id)
			}
		}
	}, [columns])

	useEffect(() => {
		if(sortDriverPlacement){
			setCustomColumns([{
				id: 'handle',
				label: '',
			}, ...columns])
		} else {
			if(customColumns[0].id == 'handle'){
				setCustomColumns(columns)
			}
		}
	},[sortDriverPlacement])

	const handleFilterByName = (event) => {
		setPage(0)
		setFilterName(event.target.value)
	}

	const filteredData = applySortFilter(
		sortedData,
		getComparator(order, orderBy),
		filterName,
		columns
	)
	const handleRequestSort = (event, property) => {
		const isAsc = orderBy === property && order === "asc"
		setOrder(isAsc ? "desc" : "asc")
		setOrderBy(property)
	}

	const createSortHandler = (property) => (event) => {
		handleRequestSort(event, property)
	}

	const handleSelectAllClick = (event) => {
		if (event.target.checked) {
			const newSelecteds = data.map((n) => n.id)
			setSelected(newSelecteds)
			return
		}
		setSelected([])
	}

	const handleChangePage = (event, newPage) => {
		setPage(newPage)
	}

	const handleChangeRowsPerPage = (event) => {
		setPage(0)
		setRowsPerPage(parseInt(event.target.value, 10))
	}

	const handleClick = (event, name) => {
		const selectedIndex = selected.indexOf(name)
		let newSelected = []
		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, name)
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1))
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1))
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(
				selected.slice(0, selectedIndex),
				selected.slice(selectedIndex + 1)
			)
		}
		setSelected(newSelected)
	}

	const emptyRows =
		page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0

	const isNotFound = !filteredData.length && !!filterName

	const handleDragEnd = (result, provided) => {
		if (!result.destination) {
			return
		}

		if (result.destination.index === result.source.index) {
			return
		}
		console.log(result)

		setSortedData((prev) => {
			const temp = [...prev]
			const d = temp[result.destination.index]
			temp[result.destination.index] = temp[result.source.index]
			temp[result.destination.index].index_sort = result.destination.index + ""
			temp[result.source.index] = d
			temp[result.source.index].index_sort = result.source.index + ""

			console.log(temp, "TEMP")
			return temp
		})
	}

	const handleSortSubmission = async () => {
		//console.log(sortedData)
		let body = sortedData.map((el) => {
			return { ...el, index_sort: +el.index_sort }
		})
		console.log(body)
		try {
			let res = await TournamentModel.sortDriver(body)
			swal.fire({
				text: "Urutan berhasil diubah!",
				icon: "success"
			})
		} catch (error) {
			swal.fireError({
				text: error?.error_message || "Gagal mengubah urutan"
			})
		}
	}

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

			<div>
				<Flex className="mb-1" justify={"space-between"} align={"center"}>
					<Flex
						gap={8}
						className="mb-3"
						style={{ fontWeight: "bold", fontSize: "1.1em" }}
					>
						<div className="mb-2">{title}</div>
					</Flex>
					{!sortDriverPlacement ? (
						<AntButton
							size={"middle"}
							type={"primary"}
							onClick={() => setSortDriverPlacement(true)}
						>
							Ubah Urutan Driver
						</AntButton>
					) : (
						data !== sortedData && (
							<AntButton
								size={"middle"}
								type={"primary"}
								onClick={handleSortSubmission}
							>
								Simpan Urutan Driver
							</AntButton>
						)
					)}
				</Flex>
			</div>

			<TableContainer sx={{ minWidth: 0, fontFamily: "Open Sans" }}>
				<Table>
					<TableHead>
						<TableRow>
							{checkbox && (
								<TableCell padding="checkbox">
									<Checkbox
										indeterminate={
											selected.length > 0 && selected.length < data.length
										}
										checked={data.length > 0 && selected.length === data.length}
										onChange={handleSelectAllClick}
									/>
								</TableCell>
							)}
							{customColumns.map((headCell) => (
								<TableCell
									width={headCell?.width}
									style={{ color: mode === "dark" ? "white" : "black" }}
									scope="row"
									component={"th"}
									key={headCell.id}
									align={headCell.alignment ? headCell.alignment : "left"}
									sortDirection={orderBy === headCell.id ? order : false}
								>
									<TableSortLabel
										style={{ color: mode === "dark" ? "white" : "black" }}
										hideSortIcon
										active={orderBy === headCell.id}
										direction={orderBy === headCell.id ? order : "asc"}
										onClick={createSortHandler(headCell.id)}
									>
										{headCell.label}
										{orderBy === headCell.id ? (
											<Box sx={{ ...visuallyHidden }}>
												{order === "desc"
													? "sorted descending"
													: "sorted ascending"}
											</Box>
										) : null}
									</TableSortLabel>
								</TableCell>
							))}
						</TableRow>
					</TableHead>

					{/* <TableBody style={{backgroundColor: "white", minWidth: "100%"}}>
                    <ReactSortable
                        list={sortedData}
                        setList={setSortedData}
                        direction={"vertical"}
                        style={{backgroundColor: "transparent", minWidth: "100%"}}
                        
                    >
                    {sortedData.map((row, key) => {
                        const {id} = row;
                        const selectedItem = selected.indexOf(id) !== -1;

                        return (
                            <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedItem}
                                      style={{cursor: rowAction?.onClick ? 'pointer' : 'default', minWidth: "100%", backgroundColor: "red"}}>
                                {
                                    checkbox && <TableCell padding="checkbox">
                                        <Checkbox checked={selectedItem} onChange={(event) => handleClick(event, id)}/>
                                    </TableCell>
                                }

                                {
                                    columns.map((columnSetting, key) => {
                                        return <>
                                            <TableCell
                                                style={{color: mode === 'dark' ? "white" : 'black'}}
                                                onClick={columnSetting.link ? () => rowAction?.onClick(row) : null}
                                                align={columnSetting.alignment}>{
                                                columnSetting.render ?
                                                    columnSetting.render(row)
                                                    :
                                                    row[columnSetting.id] ? row[columnSetting.id] : "-"
                                            }</TableCell>
                                        </>
                                    })
                                }

                            </TableRow>
                        );
                    })}
                    </ReactSortable>
                    {emptyRows > 0 && (
                        <TableRow style={{height: 53 * emptyRows}}>
                            <TableCell colSpan={6}/>
                        </TableRow>
                    )}
                </TableBody> */}

					<DragDropContext onDragEnd={handleDragEnd}>
						<Droppable droppableId="droppable" direction="vertical">
							{(droppableProvided) => (
								<TableBody
									//style={{ backgroundColor: "white", minWidth: "100%" }}
									ref={droppableProvided.innerRef}
									{...droppableProvided.droppableProps}
								>
									{sortedData.map((row, key) => {
										const { id } = row
										const selectedItem = selected.indexOf(id) !== -1

										return (
											<Draggable
												key={row.username}
												draggableId={row.username}
												index={key}
											>
												{(draggableProvided, snapshot) => {
													return (
														<TableRow
															ref={draggableProvided.innerRef}
															{...draggableProvided.draggableProps}
															hover
															key={id}
															tabIndex={-1}
															role="checkbox"
															selected={selectedItem}
															style={{
																...draggableProvided.draggableProps.style,
																cursor: rowAction?.onClick
																	? "pointer"
																	: "default"
																//minWidth: "100%",
																//backgroundColor: "red"
															}}
														>
															{sortDriverPlacement && <TableCell {...draggableProvided.dragHandleProps}>
																<div {...draggableProvided.dragHandleProps}>
																	<Iconify
																		icon={"material-symbols:reorder"}
																		style={{ color: "white" }}
																	/>
																</div>
															</TableCell>}
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
																			style={{
																				color:
																					mode === "dark" ? "white" : "black"
																			}}
																			onClick={
																				columnSetting.link
																					? () => rowAction?.onClick(row)
																					: null
																			}
																			align={columnSetting.alignment}
																		>
																			{columnSetting.render
																				? columnSetting.render(row)
																				: row[columnSetting.id]
																				? row[columnSetting.id]
																				: "-"}
																		</TableCell>
																	</>
																)
															})}
														</TableRow>
													)
												}}
											</Draggable>
										)
									})}

									{emptyRows > 0 && (
										<TableRow style={{ height: 53 * emptyRows }}>
											<TableCell colSpan={6} />
										</TableRow>
									)}
									{droppableProvided.placeholder}
								</TableBody>
							)}
						</Droppable>
					</DragDropContext>
					{isNotFound && (
						<TableBody>
							<TableRow>
								<TableCell align="center" colSpan={6} sx={{ py: 3 }}>
									<Paper
										sx={{
											textAlign: "center",
											backgroundColor: "transparent",
											fontFamily: "Open Sans"
										}}
									>
										<Typography variant="h6" paragraph>
											Data Tidak Ditemukan
										</Typography>

										<Typography variant="body2">
											Tidak ada data ditemukan untuk &nbsp;
											<strong>&quot;{filterName}&quot;</strong>.
											<br /> Periksa nama barang atau coba dengan kata kunci
											lain
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
					classes={"flex"}
					count={data.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			)}
		</>
	)
}

export default CustomTableSortable
