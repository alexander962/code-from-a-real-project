import React, { useCallback, useEffect } from 'react'
import {
	Divider,
	ListItem,
	ListItemText,
	Typography
} from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { useLazyQuery } from '@apollo/client'
import ApiProvider from '../common/containers/ApiProvider'
import { getContact } from '../../graphql/contacts/queries'
import { setOneContact } from '../../redux/actions/contacts'
import { showErrorMessage } from '../../redux/sagas/common'
const useStyles = makeStyles((theme) => ({
	contactTitle: {
		marginRight: theme.spacing(1)
	},
	item: {
		paddingLeft: 0
	}
}))

const ContactsContainer = props => {
	return(
		<ApiProvider api='contacts'>
			<Contacts {...props} />
		</ApiProvider>
	)
}

function Contacts({contact}) {

	const classes = useStyles()
	const history = useHistory()
	const dispatch = useDispatch()
	const rootCompany = useSelector(state => state?.companies?.rootCompany)

	const [getOneContact, { data, error }] = useLazyQuery(getContact, {
		variables: {
			ownerProfileId: rootCompany?.profileId,
			contactProfileId: contact?.contactProfileId
		},
	})

	error && dispatch(showErrorMessage(error.message))

	const handleRow = useCallback(() => {
		getOneContact()
	}, [])

	useEffect(() => {
		if (data) {
			dispatch(setOneContact(data.getContact))
			history.push({pathname:`/contact/${contact?.contactProfileId}`})
		}
	},[data])

	return (
		<>
			<ListItem alignItems="flex-start" button classes={{root: classes.item}}>
				<ListItemText
					primary={contact.name}
					onClick={() => handleRow()}
					secondary={
						<>
							<Typography
								component="span"
								variant="body1"
								color="textPrimary"
								className={classes.contactTitle}
							>
								{contact.contactDisplayName}
							</Typography>
						</>
					}
				/>
			</ListItem>
			<Divider component="li" />
		</>
	)
}

Contacts.propTypes = {
	contact: PropTypes.object,
}

export default ContactsContainer
