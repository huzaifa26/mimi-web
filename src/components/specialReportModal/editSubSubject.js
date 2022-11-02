import { Grid, Input, makeStyles } from "@material-ui/core";
import React, { Fragment, useState, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { Button, Field } from "../";
import { getModalStyles } from "../../utils/helpers";
import { useStore, useUi } from "../../store";
import * as yup from "yup";
const useStyles = makeStyles((theme) => {
  return {
    ...getModalStyles(theme),
  };
});

export const EditSubSubjectBody = (props) => {
  const {
    handleClose,
    selectedSubject,
    selectedSubSubject,
    subSubjectEdited,
    subjects,
  } = props;

  const classes = useStyles();
  const [score, setScore] = useState(selectedSubSubject.totalPoints);
  const [subjectName, setSubjectName] = useState(selectedSubSubject.name);
  const [loading, setLoading] = useState(false);
  const Schema = useMemo(() => {
    return yup.object().shape({
      name: yup.string().required().min(2).max(20),
      totalPoints: yup
        .number()
        .transform((value) => (isNaN(value) ? 0 : value))
        .positive()
        .min(1)
        .max(9999)
        .required(),
    });
  }, []);
  const {actions}=useUi();
  const _handleSubmit = () => {

    try{
      
    let subjectsCopy = [...subjects];
    const payload = {
      id: selectedSubSubject.id,
      name: subjectName,
      totalPoints: parseInt(score),
      obtainedPoints: selectedSubSubject.obtainedPoints,
      subjectId: selectedSubject.id,
      // isSync:selectedSubject.isSync,
    };
    Schema.validateSync(payload)
    const index = subjectsCopy.findIndex((e) => e.id == selectedSubject.id);
    const subIndex = subjectsCopy[index].subSubject.findIndex(
      (e) => e.id == selectedSubSubject.id
    );
    subjectsCopy[index].subSubject[subIndex] = payload;

    // created new object and added the whole selected subject to avoid fetching subject in Data/index/subSubjectEdit.map() function.
    const _payload={...payload,selectedSubject:selectedSubject}

    subjectsCopy.map((sub)=>{
      if(sub.id === selectedSubject.id){
        let points=0
        sub.subSubject.map((subsub)=>{
          points=points+subsub.totalPoints;
        })
        sub.totalPoints=points;
      }
    })
    subSubjectEdited(subjectsCopy, _payload);
    handleClose();
    }
    catch(error){
      actions.alert(error.message, "error");
    }


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
              <FormattedMessage id="edit" />
            </Button>
          </Grid>
        </Grid>
      </div>
    </Fragment>
  );
};
