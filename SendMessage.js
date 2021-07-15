import React, {useCallback, useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {makeStyles} from '@material-ui/styles'
import {Button, Grid, TextField, FormControl} from '@material-ui/core'
import {useDispatch, useSelector} from 'react-redux'
import {
	SENDING_REQUEST,
	SENDING_SUCCESS,
} from '../../../redux/actions/messages'
import UploadFilePopup from '../../fileUpload/UploadFilePopup'
import RegMessageAutocomplete from '../../common/RecipientsAutocomplete'
import ButtonBack from '../../common/ButtonBack'
import PageWithSidebarContainer from '../../common/containers/PageWithSidebarContainer'
import {useLazyQuery, useMutation} from '@apollo/client'
import {getUploadUrl} from '../../../graphql/files/queries'
import AddDocumentButtonMenu from './AddDocumentButtonMenu'
import AttachedFilesList from './AttachedFilesList'
import uploadFileToS3 from '../../../utils/awsS3'
import TitleStyledInput from '../../common/TitleStyledInput'
import AttachedArchivesList from './AttachedArchivesList'
import {useForm} from 'react-hook-form'
import useIsMount from '../../../utils/isMount'
import {generateZip} from '../../../redux/api/zip'
import {showErrorMessage} from '../../../redux/sagas/common'
// import {createMessage, updateMessage} from '../../../graphql/messages/mutation'
import {createMessage, sendMessage, updateMessage} from '../../../graphql/messages/mutation'
import ApiProvider from '../../common/containers/ApiProvider'
import {fileClient} from '../../../redux/api/file'

const useStyles = makeStyles(theme => ({
	uploadMenuButton: {
		display: 'block',
		margin: theme.spacing(3, 0)
	}
}))

const MessageContainer = props => {
	return (
		<ApiProvider api='messages'>
			<SendMessage {...props} />
		</ApiProvider>
	)
}

const SendMessage = () => {
	const classes = useStyles()
	const dispatch = useDispatch()
	const history = useHistory()

	const rootCompany = useSelector(state => state?.companies?.rootCompany)
	const [draftMessageData, setDraftMessageData] = useState([])
	const timestamp = draftMessageData?.createMessage?.messageUuidAndTimestamp
	const [bulkUploadOpen, setBulkUploadOpen] = useState(0)
	const [files, setFiles] = useState([])
	const [recipientSpecificFiles, setRecipientSpecificFiles] = useState({})
	const [dataToSubmit, setDataToSubmit] = useState({})
	const [recipients, setRecipients] = useState([])

	const isMount = useIsMount()

	const [getUploadUrlHandle, {error: preSignedUrlError, data: preSignedUrlData}] = useLazyQuery(getUploadUrl, {
		variables: {
			profileId: '1626172844457440',
			messageId: timestamp,
			fileType: 'attachment',
		},
		client: fileClient
	})

	const {
		register,
		handleSubmit,
		trigger,
		formState: {
			errors
		},
		control
	} = useForm()

	preSignedUrlError && dispatch(showErrorMessage(preSignedUrlError.message))

	useEffect(async () => {
		if (preSignedUrlData) {

			const preSignedUrl = preSignedUrlData?.getUploadUrl
			const filesForZip = [...files]

			Object.keys(recipientSpecificFiles).map(zipName => {
				recipientSpecificFiles[zipName].map(file => {
					filesForZip.push(file)
				})
			})

			const fileData = await generateZip(filesForZip)
			const zip = new File([fileData], 'attachments.zip')

			uploadFileToS3(preSignedUrl, zip)
				.then(() => {
					submitMessage(dataToSubmit)
				}).catch(function (error) {
					console.log(error)
					dispatch(showErrorMessage(error.message))
				})
		}
	}, [preSignedUrlData?.getUploadUrl])

	const [createMessageFun, {data: draftData, error: draftError}] = useMutation(createMessage, {
		variables: {
			input: {
				messageType: 'REGULAR',
				ownerProfileId: '1626172844457440',
			}
		},
	})

	draftError && dispatch(showErrorMessage(draftError.message))

	useEffect(() => {
		createMessageFun()
	}, [])

	useEffect(() => {
		setDraftMessageData(draftData)
	}, [draftData])

	useEffect(async () => {
		if (!isMount) {
			await trigger('message')
		}
	}, [files, recipientSpecificFiles])

	const [updateMessageFun] = useMutation(updateMessage)

	const [sendMessageFun] = useMutation(sendMessage)

	const submitMessage = useCallback((formData) => {
		updateMessageFun(
			{
				variables: {
					input: {
						ownerProfileId: '1626172844457440',
						messageSubject: formData.messageSubject,
						message: formData.message,
						recipientProfileIds: recipients.map(recipient => recipient.contactProfileId),
						messageUuidAndTimestamp: timestamp,
						isAttachmentUploaded: false,
						isStructuredDataUploaded: false
					},
				}
			}
		).then(() => {
			sendMessageFun({
				variables: {
					input: {
						ownerProfileId: '1626172844457440',
						messageUuidAndTimestamp: timestamp,
					}
				},
			}).then(() => {
				dispatch({type: SENDING_SUCCESS})
				history.push('/messages')
			})
		})




		// const messageVariables = {
		// 	ownerProfileId: rootCompany?.profileId,
		// 	messageSubject: formData.messageSubject,
		// 	message: formData.message,
		// 	recipientProfileIds: recipients.map(recipient => recipient.contactProfileId),
		// 	messageUuidAndTimestamp: timestamp
		// }
		//
		// dispatch(createMessageRequest(messageVariables))

	}, [
		rootCompany?.profileId,
		recipients,
		timestamp,
	])

	const removeFile = useCallback(event => {
		setFiles(currentFiles => currentFiles.filter(file => file.name !== event.currentTarget.name))
	}, [])

	const removeArchive = useCallback(archiveName => {
		setRecipientSpecificFiles(currentFiles => {
			const updatedFiles = {...currentFiles}
			delete updatedFiles[archiveName]
			return updatedFiles
		})
	}, [])

	const onSubmit = useCallback(formData => {

		dispatch({type: SENDING_REQUEST})

		setDataToSubmit(formData)

		if (files.length > 0 || recipientSpecificFiles.length > 0) {
			getUploadUrlHandle()
		} else {
			submitMessage(formData)
		}

	}, [files, recipientSpecificFiles, submitMessage])

	const appendFile = useCallback(newFile => {

		const fileExists = files.some(file => file.name === newFile.name)

		if (!fileExists) {
			setFiles([...files, newFile])
		}
	}, [files])

	const hasContentValidate = useCallback(value => {
		return files.length > 0 || Object.keys(recipientSpecificFiles).length > 0 || value.trim() !== ''
	}, [files, recipientSpecificFiles])

	return (
		<PageWithSidebarContainer>
			<ButtonBack/>
			<FormControl
				component="form"
				onSubmit={handleSubmit(onSubmit)}
				fullWidth
			>
				<Grid item lg={9}>
					<TitleStyledInput
						fullWidth
						variant='standard'
						placeholder='Subject'
						name="messageSubject"
						inputProps={{
							...register('messageSubject', {required: true})
						}}
						error={!!errors.messageSubject}
						helperText={!!errors.messageSubject && 'Message subject is required'}
					/>
					<RegMessageAutocomplete
						control={control}
						setRecipients={setRecipients}
						label='To'
					/>
					<TextField
						fullWidth
						label="Message"
						name="message"
						multiline
						rows={7}
						inputProps={{
							...register('message', {
								validate: {
									hasContentValidate
								}
							})
						}}
						error={!!errors.message}
						helperText={!!errors.message && 'Message text or attachment are required'}
					/>
					<AttachedFilesList
						files={files}
						removeFile={removeFile}
					/>
					<AttachedArchivesList
						archives={recipientSpecificFiles}
						removeArchive={removeArchive}
					/>
					<AddDocumentButtonMenu
						appendFile={appendFile}
						setBulkUploadOpen={setBulkUploadOpen}
						className={classes.uploadMenuButton}
					/>
					<Button
						variant="contained"
						type="submit"
						disableElevation
						display='block'
					>
						Send
					</Button>
				</Grid>
			</FormControl>
			<UploadFilePopup
				recipients={recipients}
				externalOpen={bulkUploadOpen}
				setRecipientSpecificFiles={setRecipientSpecificFiles}
			/>
		</PageWithSidebarContainer>
	)
}

SendMessage.whyDidYouRender = true

export default MessageContainer
