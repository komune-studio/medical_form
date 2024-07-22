import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button as AntButton } from "antd"
import { Card, CardBody, Container } from "reactstrap"
import moment from "moment"
import Palette from "utils/Palette"
import LoyaltyHistoryModel from "models/LoyaltyHistoryModel"
import swal from "components/reusable/CustomSweetAlert"
import CustomTable from "components/reusable/CustomTable"
import LoyaltyShopTitleBar from "./LoyaltyShopTitleBar"
import Helper from "utils/Helper"
import { CSVLink } from "react-csv"

export default function LoyaltyHistory() {
	const [dataSource, setDataSource] = useState([])
	const headers = [
		{
			label: "ID Transaksi",
			key: "id"
		},
		{
			label: "Username",
			key: "user_username"
		},
		{
			label: "Jumlah Poin Ditukar",
			key: "total_points"
		},
		{
			label: "Tanggal & Jam",
			key: "created_at"
		}
	]
	const columns = [
		{
			id: "created_at",
			label: "Tanggal & Jam",
			filter: true,
			render: (row) => {
				return (
					<>{`${moment(row.created_at).format("dddd, MMMM Do YYYY, HH:mm")}`}</>
				)
			}
		},
		{
			id: "id",
			label: "ID Transaksi",
			filter: true
		},
		{
			id: "user_username",
			label: "Username",
			filter: true
		},
		{
			id: "total_coins",
			label: "Jumlah Poin Ditukar",
			filter: true,
			render: (row) => {
				return <>{`${Helper.formatNumber(row.total_points)}`}</>
			}
		}
	]

	// Getting all loyalty usage history
	const getHistoryData = async () => {
		try {
			let result = await LoyaltyHistoryModel.getAll()
			setDataSource(result)
		} catch (e) {
			swal.fireError({ text: e.error_message ? e.error_message : null })
		}
	}

	useEffect(() => {
		getHistoryData()
	}, [])

	return (
		<>
			<Container fluid>
				<Card
					style={{
						background: Palette.BACKGROUND_DARK_GRAY,
						color: "white"
					}}
					className="card-stats mb-4 mb-xl-0"
				>
					<CardBody>
						<LoyaltyShopTitleBar />
						<Link to="/loyalty-history/create">
							<AntButton
								style={{
									float: "right",
									position: "relative",
									top: "10px"
								}}
								onClick={() => {}}
								size={"middle"}
								type={"primary"}
							>
								Tukar Poin
							</AntButton>
						</Link>
						<CSVLink
							data={dataSource.map((el) => {
								return {
									...el,
									created_at: moment(el.created_at).format(
										"dddd, MMMM Do YYYY, HH:mm"
									)
								}
							})}
							headers={headers}
							filename={
								"Loyalty History - " +
								new moment().format("dddd, MMMM Do YYYY, HH:mm") +
								".csv"
							}
						>
							<AntButton
								style={{
									float: "right",
									position: "relative",
									marginRight: "0.5rem",
									top: "10px"
								}}
								onClick={() => {}}
								size={"middle"}
								type={"primary"}
							>
								Export Data
							</AntButton>
						</CSVLink>
						<CustomTable
							showFilter={true}
							pagination={true}
							searchText={""}
							data={dataSource}
							columns={columns}
						/>
					</CardBody>
				</Card>
			</Container>
		</>
	)
}
