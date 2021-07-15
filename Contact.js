import React, { useCallback, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import Typography from '@material-ui/core/Typography'
import {
	Box,
	Divider, List,
	ListItem,
	ListItemText,
	Popover
} from '@material-ui/core'
import Button from '@material-ui/core/Button'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation } from '@apollo/client'
import { deleteContact } from '../../graphql/contacts/mutations'
import { showErrorMessage } from '../../redux/sagas/common'
import ContactModals from './ContactModals'
import ButtonBack from '../common/ButtonBack'
import ApiProvider from '../common/containers/ApiProvider'
import PageWithSidebarContainer from '../common/containers/PageWithSidebarContainer'

const useStyles = makeStyles(theme => ({
	headerBlock: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: theme.spacing(2),
	},
	contactInfo: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
		justifyContent: 'center',
		height: theme.spacing(9),
	},
	contactInfoRetirement: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	contactAccounts: {
		marginTop: theme.spacing(5),
		marginBottom: theme.spacing(0.5)
	},
	arrowDownIcon: {
		transform: 'rotate(180deg)',
	},
	contactMoreIcon: {
		cursor: 'pointer',
		color: 'rgba(0, 0, 0, 0.54)'
	},
	headerBntText: {
		fontWeight: 500,
		marginRight: theme.spacing(1),
	},
	textWidth: {
		width: '200px',
		paddingTop: 0,
		paddingBottom: 0
	}
}))

const ContactContainer = props => {
	return (
		<ApiProvider api='contacts'>
			<Contact {...props} />
		</ApiProvider>
	)
}

const Contact = () => {
	const dispatch = useDispatch()
	const classes = useStyles()

	const [anchorEl, setAnchorEl] = useState(null)
	const [actionsMenu, setActionsMenu] = useState(null)
	const [arrowIcon, setArrowIcon] = useState(false)
	const [deleteMod, setDeleteMod] = useState(false)
	const [deactivateMod, setDeactivateMod] = useState(false)
	const [renameMod, setRenameMod] = useState(false)

	const open = Boolean(anchorEl)

	const contactInformation = useSelector(state => state?.contacts?.contact)

	const [removeContact, {error}] = useMutation(deleteContact, {
		variables: {
			ownerProfileId: contactInformation?.ownerProfileId,
			contactProfileId: contactInformation?.contactProfileId,
		}
	})

	error && dispatch(showErrorMessage(error.message))

	const handleClick = useCallback((event) => {
		setAnchorEl(event.currentTarget)
		setArrowIcon(!arrowIcon)
	}, [arrowIcon])

	const handleClose = useCallback(() => {
		setAnchorEl(null)
		setArrowIcon(!arrowIcon)
	}, [arrowIcon])

	const handleCloseActions = useCallback(() => {
		setActionsMenu(null)
	}, [])

	const handleActionsMenu = useCallback((event) => {
		setActionsMenu(event.currentTarget)
	}, [])

	const handleDeleteMod = useCallback(() => {
		setDeleteMod(true)
		setArrowIcon(!arrowIcon)
		setAnchorEl(null)
	}, [arrowIcon])

	const handleDeactivateMod = useCallback(() => {
		setActionsMenu(null)
		setDeactivateMod(true)
	}, [])

	const handleRenameMod = useCallback(() => {
		setActionsMenu(null)
		setRenameMod(true)
	}, [])

	return (
		<PageWithSidebarContainer>
			<ButtonBack/>
			<>
				<Box className={classes.headerBlock}>
					<Typography color="text.primary" variant="h4">{contactInformation?.contactDisplayName}</Typography>
					<Button
						aria-haspopup="true"
						color="primary"
						onClick={handleClick}
					>
						<Typography variant='button medium' className={classes.headerBntText}>Actions</Typography>
						<ExpandMoreIcon fontSize='small' className={arrowIcon ? classes.arrowDownIcon : ''}/>
					</Button>
					<Popover
						id="action"
						open={open}
						anchorEl={anchorEl}
						onClose={handleClose}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'right',
						}}
						transformOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
					>
						<List component="nav" aria-label="secondary mailbox folder">
							<ListItem
								button
								onClick={handleDeleteMod}
								className={classes.textWidth}
							>
								<ListItemText primary="Remove"/>
							</ListItem>
						</List>
					</Popover>
				</Box>
				<ListItem className={classes.contactInfo}>
					<Typography color="text.secondary" variant="body2">UID</Typography>
					<Typography color="text.primary" variant="body1">{contactInformation?.contactProfileId}</Typography>
				</ListItem>
				<Divider light/>
				<ListItem className={classes.contactInfo}>
					<Typography color="text.secondary" variant="body2">E-mail</Typography>
					<Typography color="text.primary" variant="body1">{contactInformation.emails && contactInformation?.emails[0] || ''}</Typography>
				</ListItem>
				<Divider light/>
				<ListItem className={classes.contactInfo}>
					<Typography color="text.secondary" variant="body2">Country</Typography>
					<Typography color="text.primary" variant="body1">{contactInformation?.address?.country || ''}</Typography>
				</ListItem>
				<Divider light/>
				<ListItem className={classes.contactInfo}>
					<Typography color="text.secondary" variant="body2">City</Typography>
					<Typography color="text.primary"
						variant="body1">{contactInformation?.address?.city || ''}</Typography>
				</ListItem>
				<Divider light/>
				{contactInformation?.accounts &&
				<>
					<Typography
						color="text.primary"
						variant="body2"
						fontWeight="bold"
						className={classes.contactAccounts}>Accounts
					</Typography>
					<Box className={classes.contactInfoRetirement}>
						<ListItem className={classes.contactInfo}>
							<Typography color="text.primary" variant="body1">Retirement account</Typography>
							<Typography color="text.secondary"
								variant="body2">{contactInformation?.account}</Typography>
						</ListItem>
						<Box>
							<MoreHorizIcon
								className={classes.contactMoreIcon}
								aria-haspopup="true"
								onClick={handleActionsMenu}
							/>
							<Popover
								id="actionsAccount"
								open={Boolean(actionsMenu)}
								anchorEl={actionsMenu}
								onClose={handleCloseActions}
								anchorOrigin={{
									vertical: 'bottom',
									horizontal: 'right',
								}}
								transformOrigin={{
									vertical: 'top',
									horizontal: 'right',
								}}
							>
								<List component="nav" aria-label="secondary mailbox folder">
									<ListItem
										button
										onClick={handleRenameMod}
										className={classes.textWidth}
									>
										<ListItemText primary="Rename"/>
									</ListItem>
								</List>
								<Divider light/>
								<List component="nav" aria-label="secondary mailbox folder">
									<ListItem
										button
										onClick={handleDeactivateMod}
										className={classes.textWidth}
									>
										<ListItemText primary="Deactivate"/>
									</ListItem>
								</List>
							</Popover>
						</Box>
					</Box>
					<Divider light/>
					<ListItem className={classes.contactInfo}>
						<Typography color="text.disabled" variant="body2">REIT (inactive)</Typography>
						<Typography color="text.disabled" variant="body2">{contactInformation?.inactive}</Typography>
					</ListItem>
					<Divider light/>
				</>
				}
				<ContactModals
					account={contactInformation?.account}
					renameMod={renameMod}
					setRenameMod={setRenameMod}
					typeModal='rename'
				/>
			</>
			<ContactModals
				renameMod={deleteMod}
				setRenameMod={setDeleteMod}
				typeModal='remove'
				removeContact={removeContact}
			/>
			<ContactModals
				renameMod={deactivateMod}
				setRenameMod={setDeactivateMod}
				typeModal='deactivate'
			/>
		</PageWithSidebarContainer>
	)
}

export default ContactContainer
