import { Grid, Input, makeStyles } from "@material-ui/core";
import React, { Fragment, useState, useMemo } from "react";
import { useEffect } from "react";
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

export const EditSubjectBody = (props) => {
  const { handleClose, selectedSubject, subjectEdited, subjects } = props;
  const { actions } = useUi();
  const classes = useStyles();
  const [score, setScore] = useState(selectedSubject.totalPoints);
  const [subjectName, setSubjectName] = useState(selectedSubject.name);
  const [loading, setLoading] = useState(false);
  const [actualSubject,setActualSubject]=useState([]);

  const handleScoreChange = (e) => {
    setScore(e.target.value)
  }

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
  useEffect(()=>{
    const subjectsCopy=[...subjects];
    subjectsCopy.map((sub)=>{
      if(selectedSubject.id === sub.id){
        console.log(sub.subSubject.length);
        console.log(selectedSubject.hasSubSubject && +actualSubject?.subSubject?.length > 0);
        setActualSubject(sub);
      }
    })
  },[])

  const _handleSubmit = () => {

try{
  let subjectsCopy = [...subjects];
  const payload = {
    id: selectedSubject.id,
    name: subjectName,
    totalPoints: score,
    // totalPoints: selectedSubject.totalPoints,
    subSubject: selectedSubject.subSubject,
    obtainedPoints: selectedSubject.obtainedPoints,
    hasSubSubject: selectedSubject.hasSubSubject,
    isSync:selectedSubject.isSync,
    type:selectedSubject.type,
    orderNo:selectedSubject.orderNo
  };
  Schema.validateSync(payload)
  const index = subjectsCopy.findIndex((e) => e.id == selectedSubject.id);
  subjectsCopy[index].name = subjectName;
  subjectsCopy[index].totalPoints = parseInt(score);
  subjectEdited(subjectsCopy, payload);
  handleClose();
} catch(error){
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
          onChange={handleScoreChange}
          disabled={selectedSubject.hasSubSubject && actualSubject?.subSubject?.length > 0}
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
