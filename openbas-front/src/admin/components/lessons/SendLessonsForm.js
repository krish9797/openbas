import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { Button } from '@mui/material';
import OldTextField from '../../../../../components/fields/OldTextField';
import inject18n from '../../../../../components/i18n';
import RichTextField from '../../../../../components/fields/RichTextField';

class SendLessonsForm extends Component {
  validate(values) {
    const { t } = this.props;
    const errors = {};
    const requiredFields = ['subject', 'body'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  }

  render() {
    const { t, onSubmit, handleClose, initialValues } = this.props;
    return (
      <Form
        keepDirtyOnReinitialize={true}
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={this.validate.bind(this)}
        mutators={{
          setValue: ([field, value], state, { changeValue }) => {
            changeValue(state, field, () => value);
          },
        }}
      >
        {({ handleSubmit, submitting, errors }) => (
          <form id="sendLessonsForm" onSubmit={handleSubmit}>
            <OldTextField
              variant="standard"
              name="subject"
              fullWidth={true}
              label={t('Subject')}
              style={{ marginTop: 20 }}
            />
            <RichTextField
              name="body"
              label={t('Message')}
              fullWidth={true}
              style={{ marginTop: 20, height: 300 }}
            />
            <div style={{ float: 'right', marginTop: 20 }}>
              <Button
                onClick={handleClose.bind(this)}
                style={{ marginRight: 10 }}
                disabled={submitting || Object.keys(errors).length > 0}
              >
                {t('Cancel')}
              </Button>
              <Button color="secondary" type="submit" disabled={submitting}>
                {t('Send')}
              </Button>
            </div>
          </form>
        )}
      </Form>
    );
  }
}

SendLessonsForm.propTypes = {
  t: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  handleClose: PropTypes.func,
  editing: PropTypes.bool,
};

export default inject18n(SendLessonsForm);
