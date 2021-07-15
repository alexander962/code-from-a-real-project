import React, { useCallback, useState } from 'react'
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Slide,
	TextField
} from '@material-ui/core'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/styles'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router-dom'
const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />
})

const useStyles = makeStyles(theme => ({
	filterButtonActive: {
		color: theme.palette.primary.main,
	},
}))

const ContactModals = (props) => {
	const { account, renameMod, setRenameMod, typeModal, removeContact } = props
	const classes = useStyles()
	const history = useHistory()
	const [inputVal, setInputVal] = useState(account)

	const remove = useCallback(() => {
		removeContact()
		history.push({pathname:'/contacts'})
	}, [])

	return (
		<Dialog
			open={renameMod}
			TransitionComponent={Transition}
			keepMounted
			onClose={() => setRenameMod(false)}
			aria-labelledby="alert-dialog-slide-title"
			aria-describedby="alert-dialog-slide-description"
		>
			<DialogTitle id="alert-dialog-slide-title" variant='h6'>
				{
					typeModal === 'rename' ? 'Rename account' : typeModal === 'remove' ? 'Remove contact?' : typeModal === 'deactivate' && 'Deactivate account?'
				}
			</DialogTitle>
			<DialogContent>
				<DialogContentText id="alert-dialog-slide-description" />
				{
					typeModal === 'rename' ? <TextField
						id="standard-required"
						label="Required"
						inputRef={input => input && input.focus()}
						value={inputVal}
						onChange={(e) => setInputVal(e.target.value)}
					/> : <DialogContentText id="alert-dialog-slide-description">
						You will not be able to send message
					</DialogContentText>
				}
			</DialogContent>
			<DialogActions>
				<Button
					onClick={() => setRenameMod(false)}
					id="btnCancel"
					variant='button medium'
					className={classes.filterButtonActive}
				>
					{
						typeModal === 'rename' ? 'Discard' : 'Keep'
					}

				</Button>
				<Button
					id="btnDelete"
					variant='button medium'
					className={classes.filterButtonActive}
					onClick={typeModal === 'remove' ? remove : null}
				>
					{
						typeModal === 'rename' ? 'Rename' : typeModal === 'remove' ? 'Remove' : typeModal === 'deactivate' && 'Deactivate'
					}

				</Button>
			</DialogActions>
		</Dialog>
	)
}

ContactModals.defaultProps = {
	renameMod: false,
	account: '',
}

ContactModals.propTypes = {
	renameMod: PropTypes.bool,
	setRenameMod: PropTypes.func,
	typeModal: PropTypes.string,
	removeContact: PropTypes.func,
	account: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.node
	])
}

export default ContactModals
