import { Grid, Input, makeStyles } from "@material-ui/core";
import React, { Fragment, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button, Field } from "..";
import { useStore, useUi } from "../../store";
import { db } from "../../utils/firebase";
import { nanoid } from "nanoid";
import { getModalStyles } from "../../utils/helpers";

const useStyles = makeStyles((theme) => {
  return {
    ...getModalStyles(theme),
  };
});

export const AddSubjectBody = (props) => {
  const { handleClose, subjects, subjectAdded } = props;
  const classes = useStyles();
  const { state: storeState } = useStore();
  const { actions } = useUi();
  const { user } = storeState;
  const [score, setScore] = useState(0);
  const [subjectName, setSubjectName] = useState("");
  const [loading, setLoading] = useState(false);

  const _handleSubmit = () => {
    let subjectsCopy = [...subjects];
    const subject_id = nanoid(6);
    const payload = {
      id: subject_id,
      name: subjectName,
      totalPoints: parseInt(score),
      subSubject: [],
      obtainedPoints: 0,
      hasSubSubject: false,
    };
    subjectsCopy.push(payload);
    subjectAdded(subjectsCopy, payload);
    handleClose();
  };
  return (
    <Fragment>
      <Field label={<FormattedMessage id="subject_name" />}>
        <Input
          className={classes.input}
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
        />
      </Field>
      <Field label={<FormattedMessage id="max_score" />}>
        <Input
          inputProps={{ min: 0 }}
          className={classes.input}
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
      </Field>

      <div className={classes.default_modal_footer}>
        <Grid container spacing={2}>
          <Grid item xs={6} justifyContent="center">
            <Button
              fullWidth
              disable={loading}
              className={classes.default_modal_buttonSecondary}
              onClick={handleClose}
            >
              <FormattedMessage id="cancel" />
            </Button>
          </Grid>
          <Grid item xs={6} justifyContent="center">
            <Button
              loading={loading}
              fullWidth
              disable={loading}
              onClick={_handleSubmit}
            >
              <FormattedMessage id="add" />
            </Button>
          </Grid>
        </Grid>
      </div>
    </Fragment>
  );
};
