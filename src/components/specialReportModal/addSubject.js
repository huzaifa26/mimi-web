import { Grid, Input, makeStyles } from "@material-ui/core";
import React, { Fragment, useState, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { Button, Field } from "..";
import { useStore, useUi } from "../../store";
import { db } from "../../utils/firebase";
import { nanoid } from "nanoid";
import { getModalStyles } from "../../utils/helpers";
import { useLocation } from "react-router-dom";
import * as yup from "yup";
const useStyles = makeStyles((theme) => {
  return {
    ...getModalStyles(theme),
  };
});

export const AddSubjectBody = (props) => {
  const location=useLocation()
  const { handleClose, subjects, subjectAdded } = props;
  const classes = useStyles();
  const { state: storeState } = useStore();
  const { actions } = useUi();
  const { user } = storeState;
  const [score, setScore] = useState(0);
  const [subjectName, setSubjectName] = useState("");
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

  const _handleSubmit = async() => {
  

    try{
      let subjectsCopy = [...subjects];
      let type=''
      if(location.pathname.includes("/groups")){
        type="group"
      } else if(location.pathname.includes("/kids")){
        type="kid"
      } else if(location.pathname.includes("/data")){
        type="basic"
      }
      const subject_id = nanoid(6);
      const payload = {
        id: subject_id,
        name: subjectName,
        totalPoints: parseInt(score),
        subSubject: [],
        obtainedPoints: 0,
        hasSubSubject: false,
        isSync:false,
        type:type,
        orderNo:subjects.length
      };
      Schema.validateSync(payload)
      let ValidationError = new yup.ValidationError('error', 'value', 'path');
      let isAvail=false;
      subjectsCopy.filter((sub)=>{
        if(sub.name === subjectName){
          isAvail=true;
        }
      })
      if(isAvail){
        return actions.alert("Subject with this name already exists.","error");
      }else if(!isAvail){
        subjectsCopy.push(payload);
        subjectAdded(subjectsCopy, payload);
        handleClose();
      }
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
              <FormattedMessage id="add" />
            </Button>
          </Grid>
        </Grid>
      </div>
    </Fragment>
  );
};
