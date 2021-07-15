import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'
import { makeStyles } from '@material-ui/styles'
import AttachFileIcon from '@material-ui/icons/AttachFile'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import {
	Box,
	Button,
	Card,
	CardContent,
	Paper,
	Table,
	TableBody,
	TableCell, TableContainer,
	TableHead,
	TablePagination,
	TableRow
} from '@material-ui/core'
// import {useDispatch} from 'react-redux'
// import {useDispatch, useSelector} from 'react-redux'
// import {getOneMessageRequest} from '../../redux/actions/messages'
import {onSaveMessages} from '../../redux/api/message'
import Typography from '@material-ui/core/Typography'
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile'
import InboxIcon from '@material-ui/icons/Inbox'
import moment from 'moment'
import PageWithSidebarContainer from '../common/containers/PageWithSidebarContainer'
import PageHeader from '../common/PageHeader'
import SearchField from '../common/SearchField'
import {useLazyQuery} from '@apollo/client'
import ApiProvider from '../common/containers/ApiProvider'
import {getMessage, listMessage} from '../../graphql/messages/queries'


const useStyles = makeStyles(theme => ({
	cardMain: {
		marginTop: theme.spacing(2),
	},
	newMessageButton: {
		marginRight: theme.spacing(2),
	},
	cardContent: {
		padding: 0,
		'&:last-child': {
			padding: 0
		},
	},
	tableHeader: {
		paddingTop: theme.spacing(0.4),
		paddingBottom: theme.spacing(0.4),
	},
	tableHeaderText: {
		fontWeight: 500,
	},
	tableTime: {
		display: 'flex'
	},
	documentIcon: {
		color: theme.palette.lightBlack,
	},
	message: {
		overflow: 'hidden',
		textOverflow: 'ellipsis'
	},
	textAlign: {
		textAlign: 'left',
	},
	bold: {
		fontWeight: 'bold',
	},
	unread: {
		textAlign: 'left',
		cursor: 'pointer',
		fontWeight: 'bold',
		textDecoration: 'none',
		color: 'black',
		lineHeight: 1.2,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	},
	read: {
		textAlign: 'left',
		cursor: 'pointer',
		fontWeight: 'normal',
		textDecoration: 'none',
		color: 'rgba(0, 0, 0, 0.54)',
		lineHeight: 1.2,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	},
	messageFrom: {
		width: '8vw'
	},
	messageSubject: {
		width: '15vw'
	},
	mainMessage: {
		width: '40vw',
		margin: 0
	},
	arrowDownIcon: {
		marginBottom: theme.spacing(-1),
		marginLeft: theme.spacing(1),
		color: theme.palette.lightBlack,
		cursor: 'pointer'
	},
	arrowUpIcon: {
		transform: 'rotate(180deg)',
		marginBottom: theme.spacing(-1),
		marginLeft: theme.spacing(1),
		color: theme.palette.lightBlack,
		cursor: 'pointer'
	},
	noMessages: {
		height: '300px',
		width: '20%',
		paddingTop: theme.spacing(12),
		margin: 'auto',
		color: theme.palette.lightBlack,
	},
	InboxIconContainer: {
		textAlign: 'center',
	},
	InboxIconText: {
		textAlign: 'center',
	},
	tableRow: {
		lineHeight: 0
	}
}))

const ListMessageContainer = props => {
	return (
		<ApiProvider api='messages'>
			<ListOfIncomingOneOffMessage {...props} />
		</ApiProvider>
	)
}

const ListOfIncomingOneOffMessage = () => {
	const [listMessageHandle, {data: listMessageData}] = useLazyQuery(listMessage, {
		variables: {
			ownerProfileId: '1626174856565914'
		}
	})

	const [getMessageHandle, {data: getMessageData}] = useLazyQuery(getMessage)

	console.log('==========>listMessageData', listMessageData)
	console.log('==========>listMessageData', getMessageData)

	const classes = useStyles()
	// const dispatch = useDispatch()
	const history = useHistory()
	const [page, setPage] = useState(0)
	const [rowsPerPage, setRowsPerPage] = useState(10)
	const [arrowIcon, setArrowIcon] = useState(true)
	// let listOfMessages = useSelector (state => state?.message?.listMessage?.data?.listMessage?.items)
	let listOfMessages = listMessageData?.listMessage?.items
	// const profileId = useSelector(state => state?.companies?.rootCompany?.profileId)
	console.log('==========>listOfMessages', listOfMessages)
	const document = <InsertDriveFileIcon variant="body1" className={classes.documentIcon} />

	useEffect(() => {
		// dispatch(listMessage({ownerProfileId: '1626174856565914'}))
		listMessageHandle()
		onSaveMessages({ownerProfileId: '1626174856565914'}).subscribe({
			next() {
				// dispatch(listMessage(
				// 	{
				// 		ownerProfileId: response?.data.onSaveMessages.ownerProfileId
				// 	}
				// ))
				listMessageHandle()
			},
			error(err) {
				console.error('onListMessages Error', err)
			}
		})
	}, [])

	const handleRow = (str, uuId) => {
		// dispatch(getOneMessageRequest({messageUuidAndTimestamp: uuId, ownerProfileId: '1626174856565914'}))
		getMessageHandle({
			variables: {
				messageUuidAndTimestamp: uuId,
				ownerProfileId: '1626174856565914',
			}
		})
		history.push(`/messages/${str}`)
	}

	const listMessages = listOfMessages?.filter(item => item.messageStatus === 'UNREAD' || item.messageStatus === 'READ')
	let rows = []
	if (arrowIcon) {
		rows = listMessages?.slice().sort((a, b) => {
			return ((b.messageUuidAndTimestamp.split('#')[1]) - (a.messageUuidAndTimestamp.split('#')[1]))
		})
	} else {
		rows = listMessages?.slice().sort((a, b) => {
			return ((a.messageUuidAndTimestamp.split('#')[1]) - (b.messageUuidAndTimestamp.split('#')[1]))
		})
	}

	const handleChangePage = (event, newPage) => {
		setPage(newPage)
	}

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10))
		setPage(0)
	}
	
	const handleNewMessage = () => {
		history.push('/messages/send-message')
	}

	const today = (new Date()).toDateString()

	const handleArrow = () => {
		setArrowIcon(!arrowIcon)
	}
	
	return (
		<PageWithSidebarContainer>
			<PageHeader variant='h6' title='Messages'>
				<Button
					variant="contained"
					className={classes.newMessageButton}
					disableElevation
					onClick={handleNewMessage}
				>
					New Message
				</Button>
				<SearchField />
			</PageHeader>
			
			{(rows?.length === 0) ? (
				<Card>
					<CardContent className={classes.cardContent}>
						<Box className={classes.noMessages}>
							<Box className={classes.InboxIconContainer}>
								<InboxIcon fontSize="large" />
							</Box>
							<Typography className={classes.InboxIconText}>
									No messages yet
							</Typography>
						</Box>

					</CardContent>
				</Card>) : (
				<Card className={classes.cardMain}>
					<CardContent className={classes.cardContent}>
						<TableContainer component={Paper}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell className={classes.tableHeader}>
											<Typography variant='body1' className={classes.tableHeaderText}>
												From
											</Typography>
										</TableCell>
										<TableCell className={classes.tableHeader}>
											<Typography variant='body1' className={classes.tableHeaderText}>
												Subject
											</Typography>
										</TableCell>
										<TableCell className={classes.tableHeader}>
											<Typography variant='body1' className={classes.tableHeaderText}>
												Message
											</Typography>
										</TableCell>
										<TableCell className={classes.tableHeader}>
											<AttachFileIcon variant='body1' className={classes.tableHeaderText}/>
										</TableCell>
										<TableCell className={classes.tableHeader}>
											<Box className={classes.tableTime}>
												<Typography variant='body1' className={classes.tableHeaderText}>
													Time
												</Typography>
												<ArrowDownwardIcon className={arrowIcon ? classes.arrowUpIcon : classes.arrowDownIcon} onClick={handleArrow}/>
											</Box>
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{rows && rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) =>(
										<TableRow
											key={row?.messageUuidAndTimestamp.split('#')[0]}
											onClick={() => handleRow(row?.messageUuidAndTimestamp.split('#')[0], row?.messageUuidAndTimestamp)}
											className={classes.tableRow}
										>
											{
												(row?.senderDisplayName === null) ? (
													<TableCell scope="row" className={classes.messageSubject}>
														{row?.ownerProfileId}
													</TableCell>
												) : (
													<TableCell
														scope="row"
														className={classes.messageFrom}
													>
														<Typography className={row?.messageStatus === 'READ' ? `${classes.read} ${classes.messageFrom}` : `${classes.unread} ${classes.messageFrom}`}>
															{row?.senderDisplayName}
														</Typography>
													</TableCell>

												)
											}
											<TableCell align="right" className={classes.messageSubject} scope="row">
												<Typography variant='body2' className={row?.messageStatus === 'READ' ? `${classes.read} ${classes.messageSubject}` : `${classes.unread} ${classes.messageSubject}`}>
													{row?.messageSubject}
												</Typography>
											</TableCell>

											<TableCell variant='body2' className={classes.mainMessage} scope="row">
												<Typography className={row?.messageStatus === 'READ' ? `${classes.read} ${classes.mainMessage}` : `${classes.unread} ${classes.mainMessage}`}>
													{row?.message}
												</Typography>
											</TableCell>
											<TableCell align="right" className={classes.unread} scope="row">
												<Typography className={row?.messageStatus === 'READ' ? classes.read : classes.unread}>
													{row?.attachment?.file ? document : null}
												</Typography>
											</TableCell>
											<TableCell align="right" className={classes.unread} scope="row">
												<Typography className={row?.messageStatus === 'READ' ? classes.read : classes.unread}>
													{(new Date(+row.messageUuidAndTimestamp.split('#')[1])).toDateString() === today ? moment((new Date(+row.messageUuidAndTimestamp.split('#')[1]))).format('LT') : moment((new Date(+row.messageUuidAndTimestamp.split('#')[1])).toDateString()).format('L')}
												</Typography>
											</TableCell>
										</TableRow>
									))
									}
								</TableBody>
							</Table>
							<TablePagination
								rowsPerPageOptions={[5, 10, 25]}
								component="div"
								count={+rows?.length ? +rows?.length : 0}
								rowsPerPage={rowsPerPage}
								page={page}
								onPageChange={handleChangePage}
								onRowsPerPageChange={handleChangeRowsPerPage}
							/>
						</TableContainer>
					</CardContent>
				</Card>
			)
			}
		</PageWithSidebarContainer>
	)
}

export default ListMessageContainer
