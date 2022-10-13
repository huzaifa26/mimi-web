import { Grid, Input, makeStyles } from "@material-ui/core";
import React, { Fragment, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button, Field } from "../";
import { getModalStyles } from "../../utils/helpers";

const useStyles = makeStyles((theme) => {
  return {
    ...getModalStyles(theme),
  };
});

export const EditSubjectBody = (props) => {
  const { handleClose, selectedSubject, subjectEdited, subjects } = props;

  const classes = useStyles();
  const [score, setScore] = useState(selectedSubject.totalPoints);
  const [subjectName, setSubjectName] = useState(selectedSubject.name);
  const [loading, setLoading] = useState(false);

  const handleScoreChange = (e) => {
    console.log(e.target.value);
    setScore(e.target.value)
  }

  const _handleSubmit = () => {
    let subjectsCopy = [...subjects];
    const payload = {
      id: selectedSubject.id,
      name: subjectName,
      // totalPoints: score,
      totalPoints: selectedSubject.totalPoints,
      subSubject: selectedSubject.subSubject,
      obtainedPoints: selectedSubject.obtainedPoints,
      hasSubSubject: selectedSubject.hasSubSubject,
    };
    console.log(payload);
    const index = subjectsCopy.findIndex((e) => e.id == selectedSubject.id);
    subjectsCopy[index].name = subjectName;
    subjectsCopy[index].totalPoints = parseInt(score);
    subjectEdited(subjectsCopy, payload);
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
          onChange={handleScoreChange}
          disabled={selectedSubject.hasSubSubject}
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
              <FormattedMessage id="edit" />
            </Button>
          </Grid>
        </Grid>
      </div>
    </Fragment>
  );
};
