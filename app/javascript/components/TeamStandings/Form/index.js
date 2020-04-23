import React from 'react'
import { Formik, Field, FieldArray } from 'formik'
import PropTypes from 'prop-types'

import Input from 'components/ui/Input'
import { FormBody, FormGroup, Label, Row, DeleteButton, Footer } from './elements'
import CompetitorSelect from './CompetitorSelect'
import Button from 'components/ui/Button'

const Form = ({ initialValues, onSubmit, onCancel, isDeletable, onDelete }) => {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={({ values, handleSubmit, setFieldValue, isSubmitting }) => (
        <form onSubmit={handleSubmit}>
          <FormBody>
            <FormGroup>
              <Label>Name</Label>
              <Field as={Input} name="name" />
            </FormGroup>

            <FormGroup>
              <Label>Competitors</Label>
              <FieldArray
                name="competitorIds"
                render={arrayHelpers => (
                  <>
                    {values.competitorIds.map((id, idx) => (
                      <Row key={idx}>
                        <Field
                          as={CompetitorSelect}
                          name={`competitorIds[${idx}]`}
                          onChange={value =>
                            setFieldValue(`competitorIds[${idx}]`, value)
                          }
                        />
                        <DeleteButton onClick={() => arrayHelpers.remove(idx)}>
                          &times;
                        </DeleteButton>
                      </Row>
                    ))}

                    <Button type="button" onClick={() => arrayHelpers.push()}>
                      <i className="fa fa-plus" />
                      &nbsp; Competitor
                    </Button>
                  </>
                )}
              />
            </FormGroup>
          </FormBody>
          <Footer>
            <div>
              {isDeletable && (
                <Button type="button" onClick={onDelete} disabled={isSubmitting}>
                  {I18n.t('general.delete')}
                </Button>
              )}
            </div>
            <div>
              <Button type="submit" disabled={isSubmitting}>
                {I18n.t('general.save')}
              </Button>
              <Button type="button" onClick={onCancel} disabled={isSubmitting}>
                {I18n.t('general.cancel')}
              </Button>
            </div>
          </Footer>
        </form>
      )}
    />
  )
}

Form.propTypes = {
  initialValues: PropTypes.shape({
    name: PropTypes.string.isRequired,
    competitorIds: PropTypes.arrayOf(PropTypes.number).isRequired
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isDeletable: PropTypes.bool,
  onDelete: PropTypes.func
}

Form.defaultProps = {
  isDeletable: false,
  onDelete: () => {}
}

export default Form
