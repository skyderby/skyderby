import React from 'react'
import Form from 'components/Places/Form'
import styles from './styles.module.scss'
import { usePlaceQuery, useUpdatePlaceMutation } from 'api/places'
import LoadingSpinner from 'components/LoadingSpinner'
import useDeletePlaceMutation from 'api/places/useDeletePlaceMutation'

type EditProps = {
  placeId: number
}

const Edit = ({ placeId }: EditProps) => {
  const { data: place, isSuccess } = usePlaceQuery(placeId)
  const mutation = useUpdatePlaceMutation(placeId)
  const deleteMutation = useDeletePlaceMutation(placeId)

  if (!isSuccess) return <LoadingSpinner />

  return (
    <div className={styles.container}>
      <Form
        initialValues={place}
        mutation={mutation}
        deleteMutation={deleteMutation}
        returnUrl={`/places/${placeId}`}
      />
    </div>
  )
}

export default Edit
